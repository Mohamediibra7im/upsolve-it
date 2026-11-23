import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {
  ProblemStatement,
  ProblemStatementSchema,
} from './problem-statement.schema';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ProblemStatement.name, schema: ProblemStatementSchema },
    ]),
  ],
  controllers: [ProblemsController],
  providers: [ProblemsService],
})
export class ProblemsModule {}
