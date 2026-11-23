import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AtcoderController } from './atcoder.controller';
import { AtcoderService } from './atcoder.service';

@Module({
  imports: [AuthModule],
  controllers: [AtcoderController],
  providers: [AtcoderService],
})
export class AtcoderModule {}
