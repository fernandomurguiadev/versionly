import { IsString } from 'class-validator';

export class AuthVerifyEmailDto {
  @IsString()
  token: string;
}
