import { IsEmail, MaxLength } from 'class-validator';

export class AuthResendVerificationDto {
  @IsEmail()
  @MaxLength(255)
  email: string;
}
