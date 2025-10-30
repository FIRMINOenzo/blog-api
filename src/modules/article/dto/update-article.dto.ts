import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArticleDto {
  @ApiPropertyOptional({
    example: 'Updated Article Title',
    description: 'Article title (min 5 characters)',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated content of the article...'.repeat(10),
    description: 'Article content (min 100 characters)',
  })
  @IsOptional()
  @IsString()
  content?: string;
}
