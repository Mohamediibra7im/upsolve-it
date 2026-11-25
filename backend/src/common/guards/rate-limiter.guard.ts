import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  HttpException,
} from '@nestjs/common';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

interface RateLimitOptions {
  points: number;
  duration: number;
  keyPrefix?: string;
  /** What the caller is told at the limit, where the page shows it as it is. */
  message?: string;
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private limiters: Map<string, RateLimiterMemory> = new Map();

  constructor(@Inject(ConfigService) private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const handler = context.getHandler();
    const controller = context.getClass();

    const rateLimitOptions = this.getRateLimitOptions(handler, controller);

    if (!rateLimitOptions) {
      return true;
    }

    const key = this.getKey(request, rateLimitOptions.keyPrefix);
    const limiter = this.getLimiter(rateLimitOptions);

    return this.consume(limiter, key, response, rateLimitOptions.message);
  }

  private getRateLimitOptions(
    handler: any,
    controller: any,
  ): RateLimitOptions | null {
    const endpointKey = `${controller.name}.${handler.name}`;

    const rateLimitMap: Record<string, RateLimitOptions> = {
      'AuthController.login': {
        points: 5,
        duration: 60 * 15,
        keyPrefix: 'auth:login',
      },
      'AuthController.register': {
        points: 3,
        duration: 60 * 60,
        keyPrefix: 'auth:register',
      },
      'AuthController.refresh': {
        points: 10,
        duration: 60 * 15,
        keyPrefix: 'auth:refresh',
      },
      'AuthController.generateVerificationCode': {
        points: 3,
        duration: 60 * 60,
        keyPrefix: 'auth:verify-code',
      },
      'AuthController.verifyCodeforcesProfile': {
        points: 5,
        duration: 60 * 60,
        keyPrefix: 'auth:verify-profile',
      },
      'RemindersController.subscribe': {
        points: 3,
        duration: 60 * 60,
        keyPrefix: 'reminders:subscribe',
      },
      'RemindersController.redeem': {
        points: 20,
        duration: 60 * 60,
        keyPrefix: 'reminders:redeem',
      },
      'UpsolveController.sync': {
        points: 30,
        duration: 60 * 60,
        keyPrefix: 'upsolve:sync',
      },
      'FriendsController.sendRequest': {
        points: 10,
        duration: 60 * 60,
        keyPrefix: 'friends:add',
      },
      'TrainingsController.create': {
        points: 20,
        duration: 60 * 60,
        keyPrefix: 'training:start',
      },
      'TrainingSessionsController.create': {
        points: 20,
        duration: 60 * 60,
        keyPrefix: 'training:start',
      },
      'AuthController.initiateReset': {
        points: 5,
        duration: 60 * 15,
        keyPrefix: 'auth:reset-start',
      },
      'AuthController.verifyResetProfile': {
        points: 10,
        duration: 60 * 15,
        keyPrefix: 'auth:reset-verify',
      },
      'AuthController.resetPassword': {
        points: 5,
        duration: 60 * 15,
        keyPrefix: 'auth:reset-password',
      },
      // Each of these spends something that is not ours: a run at the code
      // runner, a page read from a judge.
      'RunnerController.run': {
        points: 30,
        duration: 60 * 10,
        keyPrefix: 'runner:run',
      },
      'ProblemsController.statement': {
        points: 60,
        duration: 60 * 10,
        keyPrefix: 'problems:statement',
      },
      // The /try page, for visitors with no account: the caller is an address.
      // TryController also holds one daily allowance for all of them.
      'TryController.run': {
        points: 10,
        duration: 60 * 10,
        keyPrefix: 'try:run',
        message:
          'You have used the free runs for now. Try again in a few minutes, or create an account to keep going.',
      },
      'TryController.statement': {
        points: 60,
        duration: 60 * 10,
        keyPrefix: 'try:statement',
      },
      'UpsolveController.addByUrl': {
        points: 30,
        duration: 60 * 60,
        keyPrefix: 'upsolve:add-by-url',
      },
      'UpsolveController.add': {
        points: 30,
        duration: 60 * 60,
        keyPrefix: 'upsolve:add',
      },
      'AuthController.syncProfile': {
        points: 10,
        duration: 60 * 15,
        keyPrefix: 'auth:sync-profile',
      },
      'ProfileController.update': {
        points: 30,
        duration: 60 * 15,
        keyPrefix: 'profile:update',
      },
      // Unauthenticated read. Its own bucket: the web server renders /u/:handle
      // for every visitor from one address, so it must not share 'global'.
      'PublicProfileController.read': {
        points: 120,
        duration: 60,
        keyPrefix: 'public-profile:read',
      },
      // Unauthenticated read, asked for on every site load: its own bucket too.
      'AnnouncementsController.current': {
        points: 120,
        duration: 60,
        keyPrefix: 'announcements:current',
      },
      // Unauthenticated reads behind /problems and /topics. The web server
      // renders both for every visitor from one address: their own buckets.
      'ProblemsController.catalog': {
        points: 300,
        duration: 60,
        keyPrefix: 'problems:catalog',
      },
      'ProblemsController.topics': {
        points: 120,
        duration: 60,
        keyPrefix: 'problems:topics',
      },
      // Unauthenticated read, answered from memory. The web server asks for
      // every visitor of /contests from one address, and every browser asks
      // once in five minutes for the footer's "next contest".
      'ContestsController.upcoming': {
        points: 600,
        duration: 60,
        keyPrefix: 'contests:upcoming',
      },
      // Rooms. Everyone in a room asks for it every 2 to 5 seconds, hence 900.
      // This guard runs before AuthGuard, so the caller here is an address:
      // people behind one address share these, and a room is often a whole
      // team on one network. Each person reads the room every 2 to 5 seconds,
      // so the read limit is sized for several full rooms behind one address.
      'RoomsController.create': {
        points: 60,
        duration: 60 * 60,
        keyPrefix: 'rooms:create',
      },
      'RoomsController.get': {
        points: 6000,
        duration: 60 * 10,
        keyPrefix: 'rooms:get',
      },
      'RoomsController.join': {
        points: 200,
        duration: 60 * 10,
        keyPrefix: 'rooms:join',
      },
      'RoomsController.start': {
        points: 60,
        duration: 60 * 10,
        keyPrefix: 'rooms:start',
      },
      'RoomsController.progress': {
        points: 2000,
        duration: 60 * 10,
        keyPrefix: 'rooms:progress',
      },
      'RoomsController.endVote': {
        points: 300,
        duration: 60 * 10,
        keyPrefix: 'rooms:end-vote',
      },
      'RoomsController.leave': {
        points: 200,
        duration: 60 * 10,
        keyPrefix: 'rooms:leave',
      },
    };

    // Health endpoints are hit frequently by Fly.io / Docker health checkers;
    // exempt them from rate limiting so probes never get 429'd.
    if (controller.name === 'HealthController') {
      return null;
    }

    // Fallback: every unlisted route still gets a broad per-IP limit so no
    // endpoint is completely unthrottled (scraping / DoS protection).
    return (
      rateLimitMap[endpointKey] || {
        points: 120,
        duration: 60,
        keyPrefix: 'global',
      }
    );
  }

  private getKey(request: Request, prefix?: string): string {
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const user = (request as any).user;
    const userId = user?._id?.toString() || user?.id || 'anonymous';
    return `${prefix || 'global'}:${ip}:${userId}`;
  }

  private getLimiter(options: RateLimitOptions): RateLimiterMemory {
    const key = `${options.keyPrefix}:${options.points}:${options.duration}`;

    if (!this.limiters.has(key)) {
      this.limiters.set(
        key,
        new RateLimiterMemory({
          points: options.points,
          duration: options.duration,
        }),
      );
    }

    return this.limiters.get(key)!;
  }

  private async consume(
    limiter: RateLimiterMemory,
    key: string,
    response: Response,
    message = 'Too Many Requests',
  ): Promise<boolean> {
    try {
      const rateLimiterRes: RateLimiterRes = await limiter.consume(key);

      this.setRateLimitHeaders(response, rateLimiterRes, limiter.points);
      return true;
    } catch (rateLimiterRes) {
      if (rateLimiterRes instanceof RateLimiterRes) {
        this.setRateLimitHeaders(response, rateLimiterRes, limiter.points);

        const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
        response.setHeader('Retry-After', retryAfter.toString());

        throw new HttpException(message, 429);
      }
      throw rateLimiterRes;
    }
  }

  private setRateLimitHeaders(
    response: Response,
    rateLimiterRes: RateLimiterRes,
    points: number,
  ): void {
    response.setHeader('X-RateLimit-Limit', points);
    response.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
    response.setHeader(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
    );
  }
}
