import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import bcrypt from 'bcryptjs';
import { TransactionsService } from '../../common/database/transactions.module';
import { PasswordResetChallenge } from './schemas/password-reset-challenge.schema';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));

const createModel = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  create: jest.fn(),
  insertMany: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let userModel: ReturnType<typeof createModel>;
  let refreshTokenModel: ReturnType<typeof createModel>;
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let auditLogs: { logAction: jest.Mock };

  const mockCfFetchOk = () =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          status: 'OK',
          result: [
            {
              rating: 1500,
              rank: 'specialist',
              maxRating: 1600,
              maxRank: 'specialist',
              avatar: 'https://userpic.codeforces.org/avatar.jpg',
              organization: 'Test Org',
              firstName: '',
              lastName: '',
            },
          ],
        }),
    });

  beforeEach(async () => {
    userModel = createModel();
    refreshTokenModel = createModel();
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
      verifyAsync: jest.fn(),
    };
    auditLogs = { logAction: jest.fn().mockResolvedValue(undefined) };

    // Mock global.fetch for Codeforces API calls in register
    global.fetch = jest.fn().mockImplementation(() => mockCfFetchOk());

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TransactionsService,
          useValue: { run: (work: () => Promise<unknown>) => work() },
        },
        {
          provide: getModelToken(PasswordResetChallenge.name),
          useValue: createModel(),
        },
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: refreshTokenModel,
        },
        { provide: JwtService, useValue: jwtService },
        { provide: AuditLogsService, useValue: auditLogs },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((k: string) =>
              k === 'JWT_REFRESH_SECRET'
                ? 'test-refresh-secret-at-least-32-chars-long'
                : undefined,
            ),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  afterEach(() => {
    delete (global as any).fetch;
    jest.restoreAllMocks();
  });

  // The rest of sign-up runs against a real database in test/usernames.e2e-spec.ts.
  describe('register', () => {
    it('rejects a weak password', async () => {
      await expect(
        service.register('testuser', 'me@example.com', 'weak', '10.1.0.1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a username with other characters', async () => {
      await expect(
        service.register(
          'no spaces',
          'me@example.com',
          'StrongP@ss1',
          '10.1.0.2',
        ),
      ).rejects.toThrow(
        'A username is 3 to 24 letters, digits or underscores.',
      );
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('rejects a taken username', async () => {
      userModel.findOne.mockReturnValue({
        collation: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.register(
          'testuser',
          'me@example.com',
          'StrongP@ss1',
          '10.1.0.3',
        ),
      ).rejects.toThrow('That username is taken.');
      expect(userModel.create).not.toHaveBeenCalled();
    });
  });

  describe('usernames', () => {
    it('gives older accounts their Codeforces handle as username', async () => {
      userModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      await service.onModuleInit();

      expect(userModel.updateMany).toHaveBeenCalledWith(
        { username: { $exists: false } },
        [{ $set: { username: '$codeforcesHandle' } }],
        { updatePipeline: true, timestamps: false },
      );
    });

    it('starts even when that pass fails', async () => {
      userModel.updateMany.mockRejectedValue(new Error('db down'));

      await expect(service.onModuleInit()).resolves.toBeUndefined();
    });

    it('logs in by username, or by handle for an account without one', async () => {
      userModel.findOne.mockReturnValue({
        collation: jest.fn().mockResolvedValue(null),
      });

      await expect(service.login('Tourist', 'pw', '127.0.0.9')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(userModel.findOne).toHaveBeenCalledWith({
        $or: [
          { username: 'Tourist' },
          { email: 'tourist', emailVerified: true },
          { username: { $exists: false }, codeforcesHandle: 'Tourist' },
        ],
      });
    });
  });

  describe('login', () => {
    it('wrong password throws 401', async () => {
      userModel.findOne.mockReturnValue({
        collation: jest.fn().mockResolvedValue({
          _id: 'uid',
          codeforcesHandle: 'testuser',
          password: 'hashed',
          locked: false,
        }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('testuser', 'wrongpass', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('locked account throws 423', async () => {
      userModel.findOne.mockReturnValue({
        collation: jest.fn().mockResolvedValue({
          _id: 'uid',
          codeforcesHandle: 'testuser',
          password: 'hashed',
          locked: true,
        }),
      });

      let error: any;
      try {
        await service.login('testuser', 'wrongpass', '127.0.0.2');
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(423);
    });
  });
});
