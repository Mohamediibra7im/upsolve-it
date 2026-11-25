import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CustomRatingsDto,
  TrainingProblemDto,
} from '../../trainings/dto/create-training.dto';
import type { TrainingMode } from '../../trainings/schemas/training.schema';

// The same list CreateTrainingDto accepts; the type keeps the two in step.
const TRAINING_MODES = [
  'ladder',
  'weakness',
  'speed',
  'contest',
  'endurance',
] as const satisfies readonly TrainingMode[];

export class CreateRoomDto {
  @IsIn(TRAINING_MODES)
  trainingMode!: TrainingMode;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  level?: string;

  @IsInt()
  @Min(1)
  @Max(600)
  durationMinutes!: number;

  @IsBoolean()
  showRatings!: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomRatingsDto)
  customRatings?: CustomRatingsDto;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => TrainingProblemDto)
  problems!: TrainingProblemDto[];
}

export class RoomProgressDto {
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  solved!: string[];

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  tried!: string[];
}
