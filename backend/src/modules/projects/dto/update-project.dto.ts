import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;
}
