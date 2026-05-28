import { IsEmail, MaxLength } from 'class-validator';

export class AuthForgotPasswordDto {
  @IsEmail()
  @MaxLength(255)
  email: string;
}
