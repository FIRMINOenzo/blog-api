import { IsDefined } from 'class-validator';

export class LoginDto {
  @IsDefined()
  readonly email: string;

  @IsDefined()
  readonly password: string;
}
