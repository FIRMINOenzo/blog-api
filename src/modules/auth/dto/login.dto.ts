import { IsDefined, IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsDefined()
  @IsEmail()
  readonly email: string;

  @IsDefined()
  @IsString()
  readonly password: string;
}
