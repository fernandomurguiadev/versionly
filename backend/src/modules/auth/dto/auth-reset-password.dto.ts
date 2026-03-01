import { IsString, MinLength } from 'class-validator';

export class AuthResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
