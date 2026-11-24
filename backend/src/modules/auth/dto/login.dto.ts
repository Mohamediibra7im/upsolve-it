import { IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  /** A username or the account's confirmed email. */
  @IsOptional()
  @IsString()
  login?: string;

  /** What pages loaded before usernames existed still send. */
  @IsOptional()
  @IsString()
  codeforcesHandle?: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
