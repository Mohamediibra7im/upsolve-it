import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProblemsModule } from '../problems/problems.module';
import { RunnerController } from './runner.controller';
import { RunnerService } from './runner.service';
import { TryController } from './try.controller';

@Module({
  imports: [AuthModule, ProblemsModule],
  controllers: [RunnerController, TryController],
  providers: [RunnerService],
})
export class RunnerModule {}
