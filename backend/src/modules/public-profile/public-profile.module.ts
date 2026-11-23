import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { UserStatsModule } from '../user-stats/user-stats.module';
import { PublicProfileController } from './public-profile.controller';
import { PublicProfileService } from './public-profile.service';

@Module({
  imports: [
    AuthModule,
    AdminModule,
    UserStatsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PublicProfileController],
  providers: [PublicProfileService],
})
export class PublicProfileModule {}
