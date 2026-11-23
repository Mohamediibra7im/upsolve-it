import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TrainingLevel,
  TrainingLevelDocument,
} from './schemas/training-level.schema';
import { getDefaultTrainingLevelDocs } from './default-training-levels.seed';

type ClientLevelRow = {
  id: number;
  level: string;
  time: string;
  Performance: string;
};

@Injectable()
export class TrainingLevelsService implements OnModuleInit {
  private readonly logger = new Logger(TrainingLevelsService.name);

  constructor(
    @InjectModel(TrainingLevel.name)
    private readonly trainingLevelModel: Model<TrainingLevelDocument>,
  ) {}

  async onModuleInit() {
    await this.seedIfEmpty();
  }

  private async seedIfEmpty(): Promise<void> {
    const count = await this.trainingLevelModel.countDocuments().exec();
    if (count > 0) return;

    const ok = getDefaultTrainingLevelDocs();
    await this.trainingLevelModel.insertMany(ok);
    this.logger.log(`Seeded ${ok.length} default training levels.`);
  }

  private toClientRow(
    d: TrainingLevelDocument | Record<string, unknown>,
  ): ClientLevelRow {
    const doc = d as {
      seqId: number;
      levelLabel: string;
      time: string;
      performance: number;
    };
    return {
      id: doc.seqId,
      level: doc.levelLabel,
      time: doc.time,
      Performance: String(doc.performance),
    };
  }

  async findAllForClient(): Promise<ClientLevelRow[]> {
    const rows = await this.trainingLevelModel
      .find()
      .sort({ seqId: 1 })
      .lean()
      .exec();
    return rows.map((r) => this.toClientRow(r));
  }
}
