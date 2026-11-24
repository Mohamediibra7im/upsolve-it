import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';

export class EmailDto {
  @IsEmail({}, { message: 'Enter a full email address, like you@example.com.' })
  @MaxLength(254)
  email!: string;
}

export class EmailCodeDto {
  @Matches(/^\d{6}$/, { message: 'The code is the 6 digits from the email.' })
  code!: string;
}

export class ConnectCodeforcesDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_.-]{3,24}$/, {
    message: 'That does not look like a Codeforces handle.',
  })
  handle!: string;
}

export class ConnectAtcoderDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_]{3,16}$/, {
    message: 'An AtCoder handle is 3 to 16 letters, digits or underscores.',
  })
  handle!: string;
}
