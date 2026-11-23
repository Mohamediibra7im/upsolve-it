import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateBy,
  ValidateIf,
} from 'class-validator';
import { AUDIENCES, type Audience } from '../schemas/announcement.schema';

// Typed by an admin and shown to every visitor, so each field is held to plain
// text. The web app repeats the caps and the link rule in
// frontend/utils/announcement.ts.

// Control characters, line/paragraph separators and bidi overrides.
const UNSAFE = '\\p{Cc}\\u2028\\u2029\\u202A-\\u202E\\u2066-\\u2069';
const ONE_LINE = new RegExp(`^[^${UNSAFE}]*$`, 'u');
const MULTI_LINE = new RegExp(`^(?:\\n|[^${UNSAFE}])*$`, 'u');

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

/** An empty or missing half of the action means "no action". */
const blankToUndefined = (params: TransformFnParams): unknown =>
  trim(params) || undefined;

const toDate = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? new Date(value) : value;

/**
 * An internal path ("/training") or a full https:// address, and nothing else:
 * no javascript:, data: or http:, and no "//host" or "/\host", which a browser
 * reads as another site.
 */
export function isActionUrl(value: unknown): boolean {
  // The prefix and character checks come first: URL() itself would trim
  // spaces and drop tabs and newlines before deciding.
  if (
    typeof value !== 'string' ||
    value.length > 300 ||
    /[\s\\<>"'`]|\p{Cc}/u.test(value)
  )
    return false;
  if (value.startsWith('/')) return !value.startsWith('//');
  if (!value.startsWith('https://')) return false;
  try {
    const url = new URL(value);
    return !url.username && !url.password && url.hostname.includes('.');
  } catch {
    return false;
  }
}

const hasAction = (dto: AnnouncementDto) =>
  dto.actionLabel !== undefined || dto.actionUrl !== undefined;
const BOTH = { message: 'The button needs both a label and a link.' };

/** Create and update take the same body: an update replaces every field. */
export class AnnouncementDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Title is required.' })
  @MaxLength(80, { message: 'Title can be at most 80 characters.' })
  @Matches(ONE_LINE, { message: 'Title must be a single line of plain text.' })
  title!: string;

  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'Message is required.' })
  @MaxLength(600, { message: 'Message can be at most 600 characters.' })
  @Matches(MULTI_LINE, { message: 'Message must be plain text.' })
  message!: string;

  @Transform(blankToUndefined)
  @ValidateIf(hasAction)
  @IsString(BOTH)
  @MaxLength(30, { message: 'Button label can be at most 30 characters.' })
  @Matches(ONE_LINE, {
    message: 'Button label must be a single line of plain text.',
  })
  actionLabel?: string;

  @Transform(blankToUndefined)
  @ValidateIf(hasAction)
  @IsString(BOTH)
  @ValidateBy({
    name: 'isActionUrl',
    validator: {
      validate: isActionUrl,
      defaultMessage: () =>
        'Button link must be a path on this site, like /training, or a full https:// address.',
    },
  })
  actionUrl?: string;

  @IsIn(AUDIENCES, { message: 'Audience must be everyone or members.' })
  audience!: Audience;

  @IsOptional()
  @Transform(toDate)
  @IsDate({ message: 'Start must be a date and time.' })
  startsAt?: Date | null;

  @IsOptional()
  @Transform(toDate)
  @IsDate({ message: 'End must be a date and time.' })
  @ValidateBy({
    name: 'endsAfterStart',
    validator: {
      validate: (end: Date, args) => {
        const start = (args?.object as AnnouncementDto).startsAt;
        return !(start instanceof Date) || end > start;
      },
      defaultMessage: () => 'End must be after the start.',
    },
  })
  endsAt?: Date | null;

  @IsBoolean({ message: 'Published must be true or false.' })
  published!: boolean;
}
