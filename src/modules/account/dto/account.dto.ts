import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty({ description: 'Role ID', type: String })
  id: string;
  @ApiProperty({ description: 'Role name', type: String })
  name: string;
}

export class AccountDto {
  @ApiProperty({ description: 'Account ID', type: String })
  id: string;
  @ApiProperty({ description: 'Account name', type: String })
  name: string;
  @ApiProperty({ description: 'Account email', type: String })
  email: string;
  @ApiProperty({ description: 'Account role', type: RoleDto })
  role: RoleDto;
  @ApiProperty({ description: 'Account created at', type: Date })
  createdAt: Date;
  @ApiProperty({ description: 'Account updated at', type: Date })
  updatedAt: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Page number', type: Number })
  page: number;
  @ApiProperty({ description: 'Limit number', type: Number })
  limit: number;
  @ApiProperty({ description: 'Total number', type: Number })
  total: number;
  @ApiProperty({ description: 'Total pages', type: Number })
  totalPages: number;
  @ApiProperty({ description: 'Has next page', type: Boolean })
  hasNextPage: boolean;
  @ApiProperty({ description: 'Has previous page', type: Boolean })
  hasPreviousPage: boolean;
}

export class PaginatedAccountsResponseDto {
  @ApiProperty({
    description: 'List of accounts',
    type: AccountDto,
    isArray: true,
  })
  data: AccountDto[];
  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
