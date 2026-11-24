import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  MongooseModule,
  getConnectionToken,
  getModelToken,
} from '@nestjs/mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Types, type Connection, type Model } from 'mongoose';
import { AdminService } from '../src/modules/admin/admin.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { AuditLogsService } from '../src/modules/audit-logs/audit-logs.service';
import { TransactionsModule } from '../src/common/database/transactions.module';
import {
  User,
  UserSchema,
  type UserDocument,
} from '../src/modules/auth/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../src/modules/auth/schemas/refresh-token.schema';
import {
  PasswordResetChallenge,
  PasswordResetChallengeSchema,
} from '../src/modules/auth/schemas/password-reset-challenge.schema';
import {
  Training,
  TrainingSchema,
} from '../src/modules/trainings/schemas/training.schema';
import {
  UserStats,
  UserStatsSchema,
} from '../src/modules/trainings/schemas/user-stats.schema';
import {
  UpsolvedProblem,
  UpsolvedProblemSchema,
} from '../src/modules/upsolve/schemas/upsolved-problem.schema';
import {
  DismissedUpsolve,
  DismissedUpsolveSchema,
} from '../src/modules/upsolve/schemas/dismissed-upsolve.schema';
import {
  Friendship,
  FriendshipSchema,
} from '../src/modules/friends/schemas/friendship.schema';
import {
  FriendRequest,
  FriendRequestSchema,
} from '../src/modules/friends/schemas/friend-request.schema';

jest.setTimeout(120_000);

/** Every collection that holds a user's own data, with the fields that name the user. */
const OWNED: [string, string[]][] = [
  [Training.name, ['user']],
  [UserStats.name, ['user']],
  [UpsolvedProblem.name, ['user']],
  [DismissedUpsolve.name, ['user']],
  [RefreshToken.name, ['userId']],
  [PasswordResetChallenge.name, ['userId']],
];

describe('admin deletes a user', () => {
  let mongo: MongoMemoryReplSet;
  let db: Connection;
  let admin: AdminService;
  let users: Model<UserDocument>;
  let close: () => Promise<void>;
  const logAction = jest.fn();
  let boss: UserDocument, target: UserDocument, bystander: UserDocument;

  const count = (model: string, filter: object) =>
    db.model(model).collection.countDocuments(filter);
  /**
   * Written straight to the collection: only who owns a record matters here.
   * The extra fields keep each record apart under the collections' unique keys.
   */
  const give = async (owner: Types.ObjectId) => {
    for (const [model, fields] of OWNED)
      await db.model(model).collection.insertOne({
        ...Object.fromEntries(fields.map((f) => [f, owner])),
        jti: String(new Types.ObjectId()),
        token: String(new Types.ObjectId()),
        judge: 'codeforces',
        contestId: 1,
        index: 'A',
      });
  };

  beforeAll(async () => {
    mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongo.getUri()),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: RefreshToken.name, schema: RefreshTokenSchema },
          {
            name: PasswordResetChallenge.name,
            schema: PasswordResetChallengeSchema,
          },
          { name: Training.name, schema: TrainingSchema },
          { name: UserStats.name, schema: UserStatsSchema },
          { name: UpsolvedProblem.name, schema: UpsolvedProblemSchema },
          { name: DismissedUpsolve.name, schema: DismissedUpsolveSchema },
          { name: Friendship.name, schema: FriendshipSchema },
          { name: FriendRequest.name, schema: FriendRequestSchema },
        ]),
        TransactionsModule,
      ],
      providers: [
        AdminService,
        { provide: AuthService, useValue: {} },
        { provide: AuditLogsService, useValue: { logAction } },
      ],
    }).compile();
    close = () => module.close();
    admin = module.get(AdminService);
    users = module.get(getModelToken(User.name));
    db = module.get(getConnectionToken());

    const make = (username: string, role = 'user') =>
      users.create({ username, password: 'x', role, isVerified: true });
    boss = await make('boss', 'admin');
    target = await make('leaving');
    bystander = await make('staying');
    await give(target._id);
    await give(bystander._id);

    const pair = (a: Types.ObjectId, b: Types.ObjectId) =>
      String(a) < String(b) ? [a, b] : [b, a];
    const [lower, higher] = pair(target._id, bystander._id);
    const [lower2, higher2] = pair(boss._id, bystander._id);
    await db.model(Friendship.name).collection.insertMany([
      { userLower: lower, userHigher: higher },
      { userLower: lower2, userHigher: higher2 },
    ]);
    await db.model(FriendRequest.name).collection.insertMany([
      { fromUser: target._id, toUser: boss._id, status: 'pending' },
      { fromUser: bystander._id, toUser: target._id, status: 'pending' },
      { fromUser: bystander._id, toUser: boss._id, status: 'pending' },
    ]);
  });

  afterAll(async () => {
    await close();
    await mongo.stop();
  });

  it('refuses to delete yourself, another admin, or nobody', async () => {
    await expect(admin.deleteUser(boss, String(boss._id))).rejects.toThrow(
      ForbiddenException,
    );
    const second = await users.create({
      username: 'second_admin',
      password: 'x',
      role: 'admin',
    });
    await expect(admin.deleteUser(boss, String(second._id))).rejects.toThrow(
      'Remove the admin role from this account before deleting it.',
    );
    await expect(
      admin.deleteUser(boss, String(new Types.ObjectId())),
    ).rejects.toThrow(NotFoundException);
    await expect(admin.deleteUser(boss, 'not-an-id')).rejects.toThrow(
      NotFoundException,
    );
    expect(await users.countDocuments()).toBe(4);
  });

  it('removes the account and everything it owns, and nothing of anyone else', async () => {
    await admin.deleteUser(boss, String(target._id));

    expect(await users.findById(target._id)).toBeNull();
    for (const [model, [field]] of OWNED) {
      expect([model, await count(model, { [field]: target._id })]).toEqual([
        model,
        0,
      ]);
      expect([model, await count(model, { [field]: bystander._id })]).toEqual([
        model,
        1,
      ]);
    }
    // the friendship and requests that involved the deleted account are gone;
    // the ones between the other two stay
    expect(await count(Friendship.name, {})).toBe(1);
    expect(await count(FriendRequest.name, {})).toBe(1);
    expect(await users.countDocuments()).toBe(3);

    expect(logAction).toHaveBeenCalledWith(
      'DELETE_USER',
      'User',
      boss._id,
      'boss',
      expect.objectContaining({ targetUsername: 'leaving' }),
      String(target._id),
    );
  });
});
