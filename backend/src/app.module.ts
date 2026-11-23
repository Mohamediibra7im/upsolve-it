import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TrainingsModule } from './modules/trainings/trainings.module';
import { UpsolveModule } from './modules/upsolve/upsolve.module';
import { AtcoderModule } from './modules/atcoder/atcoder.module';
import { ProblemsModule } from './modules/problems/problems.module';
import { RunnerModule } from './modules/runner/runner.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { TrainingLevelsModule } from './modules/training-levels/training-levels.module';
import { FriendsModule } from './modules/friends/friends.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { PublicProfileModule } from './modules/public-profile/public-profile.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { HealthModule } from './modules/health/health.module';
import { RateLimiterGuard } from './common/guards/rate-limiter.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';
        const uri =
          (nodeEnv === 'production'
            ? config.get<string>('MONGODB_URI_PROD')
            : config.get<string>('MONGODB_URI_DEV')) ??
          config.get<string>('MONGODB_URI') ??
          config.get<string>('MONGO_URL');
        if (!uri) {
          throw new Error(
            'Missing Mongo connection string. Set MONGODB_URI_DEV/MONGODB_URI_PROD (or MONGODB_URI).',
          );
        }
        return { uri };
      },
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          pinoHttp: {
            level: config.get<string>('LOG_LEVEL') ?? 'info',
            transport:
              process.env.NODE_ENV !== 'production'
                ? {
                    target: 'pino-pretty',
                    options: {
                      singleLine: true,
                      colorize: true,
                    },
                  }
                : undefined,
            serializers: {
              req: (req) => {
                return {
                  id: req.id,
                  method: req.method,
                  url: req.url,
                  query: req.query,
                  params: req.params,
                  headers: {
                    'content-type': req.headers['content-type'],
                    'user-agent': req.headers['user-agent'],
                    'x-request-id': req.headers['x-request-id'],
                  },
                };
              },
              res: (res) => {
                return {
                  statusCode: res.statusCode,
                };
              },
            },
          },
        };
      },
    }),
    AuthModule,
    TrainingsModule,
    UpsolveModule,
    AtcoderModule,
    ProblemsModule,
    RunnerModule,
    AdminModule,
    AuditLogsModule,
    TrainingLevelsModule,
    FriendsModule,
    RemindersModule,
    PublicProfileModule,
    AnnouncementsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}
