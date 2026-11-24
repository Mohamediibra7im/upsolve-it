import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  username!: string;

  @IsEmail({}, { message: 'Enter a full email address, like you@example.com.' })
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
