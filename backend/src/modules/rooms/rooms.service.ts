import { randomInt } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, type UserDocument } from '../auth/schemas/user.schema';
import type { TrainingProblemDto } from '../trainings/dto/create-training.dto';
import { makeProblemId } from '../trainings/utils/problem-ids';
import type { CreateRoomDto, RoomProgressDto } from './dto/room.dto';
import { MAX_MEMBERS, Room, type RoomMember } from './schemas/room.schema';

const PROGRESS_GRACE_MS = 2 * 60_000;

const CODE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const CODE_PATTERN = /^[a-z0-9]{8}$/;
/** After the host starts, everyone gets this long before the clock runs. */
const START_DELAY_MS = 10_000;

type StoredRoom = Room & { _id: Types.ObjectId };

const problemId = (p: TrainingProblemDto) =>
  p.problemId ?? makeProblemId(p.contestId, p.index);
const isUser = (user: UserDocument) => (m: RoomMember) =>
  m.user.equals(user._id);
const notOpen = (room: StoredRoom) =>
  new ConflictException(
    room.status === 'closed'
      ? 'This room is closed.'
      : 'This room has already started.',
  );
const statusAt = (room: StoredRoom, now: number) =>
  room.status === 'running' && now > room.endTime! ? 'ended' : room.status;
const lastSolve = (m: RoomMember) =>
  Math.max(0, ...Object.values(m.solvedAt ?? {}));

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private readonly rooms: Model<Room>,
    @InjectModel(User.name) private readonly users: Model<User>,
  ) {}

  async create(body: CreateRoomDto, user: UserDocument) {
    const ids = body.problems.map(problemId);
    // An id becomes a key of `solvedAt`, and a link is opened by other people.
    if (
      new Set(ids).size !== ids.length ||
      ids.some((id) => !/^[\w-]{1,64}$/.test(id))
    )
      throw new BadRequestException(
        'Each problem needs its own id of letters, digits, "-" and "_".',
      );
    if (body.problems.some((p) => !p.url.startsWith('https://')))
      throw new BadRequestException('Problem links must start with https://');

    // ponytail: no retry when a code is taken (1 in 36^8 per room alive);
    // the unique index answers with an error and the host creates again.
    const code = Array.from(
      { length: 8 },
      () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)],
    ).join('');
    await this.rooms.create({
      // The body through JSON: a validated DTO carries every field it did not
      // get as `undefined`, which Mongo would store as null.
      ...(JSON.parse(JSON.stringify(body)) as CreateRoomDto),
      code,
      host: user._id,
      members: [{ user: user._id, joinedAt: Date.now() }],
    });
    return { code };
  }

  async get(code: string, user: UserDocument) {
    return this.view(await this.load(code), user);
  }

  async join(code: string, user: UserDocument): Promise<unknown> {
    const room = await this.load(code);
    if (room.members.some(isUser(user))) return this.view(room, user);
    if (room.status !== 'lobby') throw notOpen(room);
    if (room.members.length >= MAX_MEMBERS)
      throw new ConflictException('This room is full.');
    const joined = await this.rooms
      .findOneAndUpdate(
        {
          _id: room._id,
          status: 'lobby',
          'members.user': { $ne: user._id },
          [`members.${MAX_MEMBERS - 1}`]: { $exists: false },
        },
        { $push: { members: { user: user._id, joinedAt: Date.now() } } },
        { returnDocument: 'after' },
      )
      .lean();
    // Nothing matched: the room changed since it was read, so look again.
    return joined ? this.view(joined, user) : this.join(code, user);
  }

  async start(code: string, user: UserDocument) {
    const room = await this.load(code);
    if (!room.host.equals(user._id))
      throw new ForbiddenException('Only the host can start the room.');
    const startTime = Date.now() + START_DELAY_MS;
    const started = await this.rooms
      .findOneAndUpdate(
        { _id: room._id, status: 'lobby' },
        {
          $set: {
            status: 'running',
            startTime,
            endTime: startTime + room.durationMinutes * 60_000,
          },
        },
        { returnDocument: 'after' },
      )
      .lean();
    if (!started) throw notOpen(room);
    return this.view(started, user);
  }

  async progress(code: string, body: RoomProgressDto, user: UserDocument) {
    const room = await this.load(code);
    const me = room.members.find(isUser(user));
    if (!me) throw new ForbiddenException('You are not in this room.');
    const now = Date.now();
    // A solve in the last seconds reaches us a little after the end, once the
    // person's browser has read it from the judge: reports are taken for two
    // more minutes.
    if (room.status !== 'running' || now > room.endTime! + PROGRESS_GRACE_MS)
      throw new ConflictException('This room is not running.');

    const known = new Set(room.problems.map(problemId));
    const mine = (ids: string[]) => [
      ...new Set(ids.filter((id) => known.has(id))),
    ];
    const fresh = mine(body.solved).filter((id) => !me.solved.includes(id));
    await this.rooms.updateOne(
      { _id: room._id, 'members.user': user._id },
      {
        $addToSet: { 'members.$.solved': { $each: fresh } },
        $set: {
          'members.$.tried': mine(body.tried),
          ...Object.fromEntries(
            fresh.map((id) => [`members.$.solvedAt.${id}`, now]),
          ),
        },
      },
    );
    return { ok: true };
  }

  async leave(code: string, user: UserDocument) {
    const room = await this.load(code);
    // Once started, everyone stays in the standings.
    if (room.status === 'lobby')
      await this.rooms.updateOne(
        { _id: room._id, status: 'lobby' },
        room.host.equals(user._id)
          ? { $set: { status: 'closed' } }
          : { $pull: { members: { user: user._id } } },
      );
    return { ok: true };
  }

  private async load(code: string): Promise<StoredRoom> {
    const room = CODE_PATTERN.test(code)
      ? await this.rooms.findOne({ code }).lean()
      : null;
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  private async view(room: StoredRoom, user: UserDocument) {
    const now = Date.now();
    const status = statusAt(room, now);
    const people = await this.users
      .find({ _id: { $in: room.members.map((m) => m.user) } })
      .select('username displayName codeforcesHandle avatar glyphAvatar rating')
      .lean();
    const person = (id: Types.ObjectId) => {
      const u = people.find((p) => p._id.equals(id));
      return {
        id: String(id),
        name: u?.displayName || u?.username || u?.codeforcesHandle || '',
        codeforcesHandle: u?.codeforcesHandle ?? '',
        avatar: u?.avatar ?? '',
        glyphAvatar: u?.glyphAvatar ?? '',
        rating: u?.rating ?? 0,
        isHost: room.host.equals(id),
      };
    };
    const isMember = room.members.some(isUser(user));
    return {
      code: room.code,
      status,
      isHost: room.host.equals(user._id),
      isMember,
      hostName: person(room.host).name,
      trainingMode: room.trainingMode,
      level: room.level,
      durationMinutes: room.durationMinutes,
      showRatings: room.showRatings,
      problemCount: room.problems.length,
      startTime: room.startTime,
      endTime: room.endTime,
      serverNow: now,
      // More solved first, then who got there earlier; ties keep join order.
      members: [...room.members]
        .sort(
          (a, b) =>
            b.solved.length - a.solved.length || lastSolve(a) - lastSolve(b),
        )
        .map((m) => ({
          ...person(m.user),
          solved: m.solved,
          tried: m.tried,
          solvedAt: m.solvedAt ?? {},
        })),
      // The set stays secret until the start, and from anyone not in the room.
      ...(isMember && (status === 'running' || status === 'ended')
        ? { problems: room.problems, customRatings: room.customRatings }
        : {}),
    };
  }
}
