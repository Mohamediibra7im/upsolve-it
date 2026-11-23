import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateBy,
} from 'class-validator';
import { JUDGES, type ContestId, type Judge } from '../schemas/judge';
import { NOTE_MAX_LENGTH } from '../schemas/upsolved-problem.schema';

/** A positive contest number, or a contest name made of letters, digits, "-" and "_". */
export const IsContestId = () =>
  ValidateBy({
    name: 'isContestId',
    validator: {
      validate: (v: unknown) =>
        (Number.isInteger(v) && (v as number) >= 1) ||
        (typeof v === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(v)),
      defaultMessage: () => 'contestId must be a contest number or name',
    },
  });

/** Names one problem. Without a judge it is a Codeforces problem. */
export class ProblemRefDto {
  @IsOptional()
  @IsIn(JUDGES)
  judge?: Judge;

  @IsContestId()
  contestId!: ContestId;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  index!: string;
}

export class CreateUpsolveProblemDto extends ProblemRefDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  rating!: number;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsNumber()
  solvedTime?: number | null;
}

export class UpdateUpsolveProblemDto extends ProblemRefDto {
  @IsOptional()
  @IsNumber()
  solvedTime?: number | null;
}

export class DeleteUpsolveProblemDto extends ProblemRefDto {}

export class AddByUrlDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  url!: string;
}

export class UpsolveNoteDto extends ProblemRefDto {
  /** An empty note clears it. */
  @IsString()
  @MaxLength(NOTE_MAX_LENGTH, {
    message: `A note can be at most ${NOTE_MAX_LENGTH} characters.`,
  })
  note!: string;
}
