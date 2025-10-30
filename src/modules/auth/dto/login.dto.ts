import { IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'User email address',
  })
  @IsDefined()
  readonly email: string;

  @ApiProperty({
    example: 'adminPass123',
    description: 'User password',
  })
  @IsDefined()
  readonly password: string;
}
