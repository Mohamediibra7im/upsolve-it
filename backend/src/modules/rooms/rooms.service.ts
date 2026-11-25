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
import {
  MAX_MEMBERS,
  Room,
  type EndedBy,
  type RoomMember,
} from './schemas/room.schema';

const PROGRESS_GRACE_MS = 2 * 60_000;
/** How long everyone has to answer a vote to end the room. */
const VOTE_WINDOW_MS = 60_000;
/** How long the person who called a vote waits before calling another. */
const VOTE_COOLDOWN_MS = 5 * 60_000;

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
const isRunning = (room: StoredRoom, now: number) =>
  room.status === 'running' && now <= room.endTime!;
/** A vote is only alive for its window; after that it is as if it was never called. */
const activeVote = (room: StoredRoom, now: number) =>
  room.endVote && now < room.endVote.at + VOTE_WINDOW_MS ? room.endVote : null;
const notRunning = () => new ConflictException('This room is not running.');
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
      throw notRunning();
    // Whoever left keeps the line they left with.
    if (me.leftAt) return { ok: true };

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
    // that solve may have been the last one anyone had left
    if (fresh.length) await this.settle(code);
    return { ok: true };
  }

  /**
   * A vote to end the room for everyone, the way a team surrenders: nobody
   * ends it alone. `agree` calls the vote when none is running and agrees to
   * it otherwise; one "keep going" stops it. It passes when everyone still in
   * the room has agreed inside the window.
   * ponytail: someone whose tab is closed still counts as in the room, so
   * they hold a vote back until they leave or the clock ends. A `seenAt`
   * stamp on each read of the room would let the vote skip them.
   */
  async endVote(
    code: string,
    agree: boolean,
    user: UserDocument,
  ): Promise<unknown> {
    const room = await this.load(code);
    const me = room.members.find(isUser(user));
    if (!me) throw new ForbiddenException('You are not in this room.');
    const now = Date.now();
    if (me.leftAt || !isRunning(room, now) || now < room.startTime!)
      throw notRunning();

    const vote = activeVote(room, now);
    const id = String(user._id);
    const thisVote = { _id: room._id, 'endVote.at': vote?.at };
    if (!agree) {
      // Ending needs everyone, so one person keeping going settles it.
      if (vote)
        await this.rooms.updateOne(thisVote, { $set: { endVote: null } });
    } else if (vote) {
      await this.rooms.updateOne(thisVote, {
        $addToSet: { 'endVote.yes': id },
      });
    } else {
      const wait = (me.calledVoteAt ?? 0) + VOTE_COOLDOWN_MS - now;
      if (wait > 0)
        throw new ConflictException(
          `You can call another vote in ${Math.ceil(wait / 60_000)} min.`,
        );
      const called = await this.rooms.updateOne(
        {
          _id: room._id,
          'members.user': user._id,
          // only where no vote is running: two people calling at once make one
          $or: [
            { endVote: null },
            { 'endVote.at': { $lte: now - VOTE_WINDOW_MS } },
          ],
        },
        {
          $set: {
            endVote: { by: id, at: now, yes: [id] },
            'members.$.calledVoteAt': now,
          },
        },
      );
      // Someone else called in the same moment: agree to theirs.
      if (!called.modifiedCount) return this.endVote(code, agree, user);
    }
    return this.view(await this.settle(code), user);
  }

  async leave(code: string, user: UserDocument) {
    const room = await this.load(code);
    const now = Date.now();
    if (room.status === 'lobby')
      await this.rooms.updateOne(
        { _id: room._id, status: 'lobby' },
        room.host.equals(user._id)
          ? { $set: { status: 'closed' } }
          : { $pull: { members: { user: user._id } } },
      );
    // Once started, everyone stays in the standings: leaving only stops
    // that person's line, and they no longer count in a vote.
    else if (isRunning(room, now)) {
      await this.rooms.updateOne(
        {
          _id: room._id,
          members: { $elemMatch: { user: user._id, leftAt: null } },
        },
        { $set: { 'members.$.leftAt': now } },
      );
      await this.settle(code);
    }
    return { ok: true };
  }

  /**
   * Ends a running room early once nothing is left to wait for: a vote that
   * everyone still in it agreed to, everything solved by all of them, or
   * nobody left. Gives the room as it then is.
   */
  private async settle(code: string): Promise<StoredRoom> {
    const room = await this.load(code);
    const now = Date.now();
    if (!isRunning(room, now)) return room;
    const present = room.members.filter((m) => !m.leftAt);
    const vote = activeVote(room, now);
    const ids = room.problems.map(problemId);
    const endedBy: EndedBy | null = !present.length
      ? 'left'
      : vote && present.every((m) => vote.yes.includes(String(m.user)))
        ? 'vote'
        : present.every((m) => ids.every((id) => m.solved.includes(id)))
          ? 'solved'
          : null;
    if (!endedBy) return room;
    // The end is one moment for everyone: whoever gets here first sets it.
    const ended = await this.rooms
      .findOneAndUpdate(
        { _id: room._id, status: 'running', endTime: room.endTime },
        { $set: { endTime: now - 1, endedBy, endVote: null } },
        { returnDocument: 'after' },
      )
      .lean();
    return ended ?? this.load(code);
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
    const me = room.members.find(isUser(user));
    const isMember = Boolean(me);
    const vote =
      isMember && status === 'running' ? activeVote(room, now) : null;
    const voteAgainAt = (me?.calledVoteAt ?? 0) + VOTE_COOLDOWN_MS;
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
      endedBy: room.endedBy ?? null,
      endVote: vote && {
        by: vote.by,
        byName: person(new Types.ObjectId(vote.by)).name,
        endsAt: vote.at + VOTE_WINDOW_MS,
        yes: vote.yes,
        /** How many have to agree: everyone still in the room. */
        needed: room.members.filter((m) => !m.leftAt).length,
      },
      /** When the caller may call a vote again, while they still have to wait. */
      voteAgainAt: voteAgainAt > now ? voteAgainAt : null,
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
          leftAt: m.leftAt ?? null,
        })),
      // The set stays secret until the start, and from anyone not in the room.
      ...(isMember && (status === 'running' || status === 'ended')
        ? { problems: room.problems, customRatings: room.customRatings }
        : {}),
    };
  }
}
