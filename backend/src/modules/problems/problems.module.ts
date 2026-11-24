import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AtcoderModule } from '../atcoder/atcoder.module';
import { AuthModule } from '../auth/auth.module';
import { CatalogService } from './catalog.service';
import {
  ProblemStatement,
  ProblemStatementSchema,
} from './problem-statement.schema';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';

@Module({
  imports: [
    AuthModule,
    AtcoderModule,
    MongooseModule.forFeature([
      { name: ProblemStatement.name, schema: ProblemStatementSchema },
    ]),
  ],
  controllers: [ProblemsController],
  providers: [ProblemsService, CatalogService],
  exports: [ProblemsService],
})
export class ProblemsModule {}
