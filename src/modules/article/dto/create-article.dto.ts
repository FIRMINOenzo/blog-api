import { IsDefined, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({
    example: 'My First Blog Post',
    description: 'Article title (min 5 characters)',
    minLength: 5,
  })
  @IsDefined()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'This is the content of my article...',
    description: 'Article content (min 100 characters)',
    minLength: 100,
  })
  @IsDefined()
  @IsString()
  content: string;
}
