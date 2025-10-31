import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiPropertyOptional({
    example: 'John Doe Updated',
    description: 'User full name',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional({
    example: 'newemail@example.com',
    description: 'User email address',
  })
  @IsOptional()
  @IsString()
  readonly email?: string;

  @ApiPropertyOptional({
    example: 'newPassword123',
    description: 'User password (min 8 characters)',
  })
  @IsOptional()
  @IsString()
  readonly password?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Role UUID',
  })
  @IsOptional()
  @IsString()
  readonly roleId?: string;
}
