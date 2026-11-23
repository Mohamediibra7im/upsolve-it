import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  UpsolvedProblem,
  UpsolvedProblemSchema,
} from '../upsolve/schemas/upsolved-problem.schema';
import { UpsolveModule } from '../upsolve/upsolve.module';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    UpsolveModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UpsolvedProblem.name, schema: UpsolvedProblemSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      // A separate secret, so an emailed link can never be used as a session.
      useFactory: (config: ConfigService) => ({
        secret: `${config.getOrThrow<string>('JWT_SECRET')}:reminders`,
      }),
    }),
  ],
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
