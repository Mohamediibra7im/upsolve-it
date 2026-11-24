import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { JUDGES, type Judge } from '../../upsolve/schemas/judge';

// A query string has no numbers and no "unset": "" means the filter is off.
const text = () =>
  Transform(({ value }) => (value === '' ? undefined : (value as unknown)));
const number = () =>
  Transform(({ value }) =>
    value === '' || value === undefined ? undefined : Number(value),
  );

/** How the catalogue is narrowed. Every part is optional. */
export class CatalogQueryDto {
  @text()
  @IsOptional()
  @IsIn(JUDGES)
  judge?: Judge;

  /** A rating range. With either end set, unrated problems are left out. */
  @number()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5000)
  min?: number;

  @number()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5000)
  max?: number;

  /** One Codeforces tag. AtCoder problems carry none, so it leaves them out. */
  @text()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  tag?: string;

  /** Part of a name, or the start of an id such as "1996E" or "abc300". */
  @text()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @number()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  page?: number;
}
