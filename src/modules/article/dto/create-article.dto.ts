import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 150)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(100, 50000)
  content: string;
}
