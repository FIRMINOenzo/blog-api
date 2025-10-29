import { IsDefined, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsDefined()
  @IsString()
  readonly name: string;

  @IsDefined()
  @IsString()
  readonly email: string;

  @IsDefined()
  @IsString()
  readonly password: string;

  @IsDefined()
  @IsString()
  readonly roleId: string;
}
