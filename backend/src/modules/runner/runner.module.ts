import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RunnerController } from './runner.controller';
import { RunnerService } from './runner.service';

@Module({
  imports: [AuthModule],
  controllers: [RunnerController],
  providers: [RunnerService],
})
export class RunnerModule {}
