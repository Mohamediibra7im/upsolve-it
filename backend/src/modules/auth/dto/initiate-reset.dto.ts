import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class InitiateResetDto {
  /** A username or the account's confirmed email. */
  @IsString()
  @IsNotEmpty()
  handle!: string;

  /** Ask for the Codeforces-profile proof although the account has an email. */
  @IsOptional()
  @IsIn(['codeforces'])
  via?: 'codeforces';
}

export class VerifyResetEmailDto {
  @IsString()
  @IsNotEmpty()
  verificationToken!: string;

  @Matches(/^\d{6}$/, { message: 'The code is the 6 digits from the email.' })
  code!: string;
}
