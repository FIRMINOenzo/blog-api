import { IsDefined, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    minLength: 3,
  })
  @IsDefined()
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsDefined()
  @IsString()
  readonly email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'User password (min 8 characters)',
    minLength: 8,
  })
  @IsDefined()
  @IsString()
  readonly password: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Role UUID (ADMIN, EDITOR, or READER)',
  })
  @IsDefined()
  @IsString()
  readonly roleId: string;
}
