import { ApiProperty } from '@nestjs/swagger';

export class AuthorDto {
  @ApiProperty({ description: 'Author ID', type: String })
  id: string;
  @ApiProperty({ description: 'Author name', type: String })
  name: string;
  @ApiProperty({ description: 'Author email', type: String })
  email: string;
}

export class ArticleDto {
  @ApiProperty({ description: 'Article ID', type: String })
  id: string;
  @ApiProperty({ description: 'Article title', type: String })
  title: string;
  @ApiProperty({ description: 'Article content', type: String })
  content: string;
  @ApiProperty({ description: 'Article slug', type: String })
  slug: string;
  @ApiProperty({ description: 'Article author', type: AuthorDto })
  author: AuthorDto;
  @ApiProperty({ description: 'Article created at', type: Date })
  createdAt: Date;
  @ApiProperty({ description: 'Article updated at', type: Date })
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

export class PaginatedArticlesResponseDto {
  @ApiProperty({
    description: 'List of articles',
    type: ArticleDto,
    isArray: true,
  })
  data: ArticleDto[];
  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
