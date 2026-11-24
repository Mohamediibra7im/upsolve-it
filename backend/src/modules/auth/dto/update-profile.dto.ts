import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsObject,
  IsString,
  Matches,
  MaxLength,
  Validate,
  ValidateIf,
  ValidateNested,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

// Everything here is typed by one user and shown to others, so each field is
// held to the narrowest shape that still works. An empty string clears a field.
// The web app repeats the username rules in frontend/utils/profileLinks.ts.

/** Present at all: unlike IsOptional, null is not let through. */
const Optional = () => ValidateIf((_, value) => value !== undefined);

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

// Control characters, line/paragraph separators and bidi overrides.
const UNSAFE = '\\p{Cc}\\u2028\\u2029\\u202A-\\u202E\\u2066-\\u2069';
const ONE_LINE = new RegExp(`^[^${UNSAFE}]*$`, 'u');
const MULTI_LINE = new RegExp(`^(?:\\n|[^${UNSAFE}])*$`, 'u');

const SEED = '[A-Za-z0-9._-]';
/** What glyph-avatar's picker emits: v1:seed[:colorSeed[:background[:c]]]. */
export const GLYPH_AVATAR_PATTERN = new RegExp(
  `^(?:v1:${SEED}{1,32}(?::${SEED}{0,32}(?::(?:solid|split|quarter|ring|halo|stripes|horizon|polka)?(?::c?)?)?)?)?$`,
);

const usernameOnly = (platform: string, allowed: string) => ({
  message: `${platform} takes a username, not a link: ${allowed} characters.`,
});

@ValidatorConstraint({ name: 'httpsUrl' })
class HttpsUrl implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (value === '') return true;
    // The prefix and character checks come first: URL() itself would trim
    // spaces and drop tabs and newlines before deciding.
    if (
      typeof value !== 'string' ||
      value.length > 200 ||
      !/^https:\/\/[^\s\p{Cc}<>"'`\\]+$/u.test(value)
    )
      return false;
    try {
      const url = new URL(value);
      return (
        url.protocol === 'https:' &&
        !url.username &&
        !url.password &&
        url.hostname.includes('.')
      );
    } catch {
      return false;
    }
  }

  defaultMessage() {
    return 'Website must be a full https:// address, like https://your-site.com, at most 200 characters.';
  }
}

export class ProfileLinksDto {
  @Optional()
  @IsString()
  @Transform(trim)
  @Matches(
    /^(?:[A-Za-z\d](?:[A-Za-z\d]|-(?=[A-Za-z\d])){0,38})?$/,
    usernameOnly('GitHub', 'letters, digits and single hyphens, up to 39'),
  )
  github?: string;

  // ponytail: ASCII only. LinkedIn also issues slugs with accented letters;
  // widen this (and the web app's copy) if someone needs one.
  @Optional()
  @IsString()
  @Transform(trim)
  @Matches(
    /^(?:[A-Za-z0-9-]{3,100})?$/,
    usernameOnly('LinkedIn', 'letters, digits and hyphens, 3 to 100'),
  )
  linkedin?: string;

  @Optional()
  @IsString()
  @Transform(trim)
  @Matches(
    /^(?:[A-Za-z0-9_]{1,15})?$/,
    usernameOnly('X', 'letters, digits and underscores, up to 15'),
  )
  x?: string;

  @Optional()
  @IsString()
  @Transform(trim)
  @Validate(HttpsUrl)
  website?: string;

  @Optional()
  @IsString()
  @Transform(trim)
  @Matches(
    /^(?:[A-Za-z0-9_]{3,16})?$/,
    usernameOnly('AtCoder', 'letters, digits and underscores, 3 to 16'),
  )
  atcoder?: string;

  @Optional()
  @IsString()
  @Transform(trim)
  @Matches(
    /^(?:[A-Za-z0-9_-]{1,40})?$/,
    usernameOnly(
      'LeetCode',
      'letters, digits, hyphens and underscores, up to 40',
    ),
  )
  leetcode?: string;
}

export class UpdateProfileDto {
  @Optional()
  @IsString()
  @Transform(trim)
  @MaxLength(60, { message: 'Name can be at most 60 characters.' })
  @Matches(ONE_LINE, { message: 'Name must be a single line of plain text.' })
  displayName?: string;

  @Optional()
  @IsString()
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string'
      ? value
          .replace(/\r\n?/g, '\n')
          .trim()
          .replace(/\n{3,}/g, '\n\n')
      : value,
  )
  @MaxLength(280, { message: 'Bio can be at most 280 characters.' })
  @Matches(MULTI_LINE, { message: 'Bio must be plain text.' })
  bio?: string;

  @Optional()
  @IsObject({ message: 'Links must be an object of usernames.' })
  @ValidateNested()
  @Type(() => ProfileLinksDto)
  links?: ProfileLinksDto;

  @Optional()
  @IsString()
  @MaxLength(80, { message: 'That avatar is not one the picker makes.' })
  @Matches(GLYPH_AVATAR_PATTERN, {
    message: 'That avatar is not one the picker makes.',
  })
  glyphAvatar?: string;
}
