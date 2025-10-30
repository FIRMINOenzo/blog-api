import { Inject, Injectable } from '@nestjs/common';
import { ArticleEntity } from 'src/domain/entities/article.entity';
import { AccountEntity } from 'src/domain/entities/account.entity';
import type { ArticleRepository } from 'src/domain/repositories/article.repository';

@Injectable()
export class CreateArticleUseCase {
  constructor(
    @Inject('ArticleRepository')
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(
    author: AccountEntity,
    input: CreateArticleInput,
  ): Promise<CreateArticleOutput> {
    const article = ArticleEntity.create(author, input.title, input.content);

    await this.articleRepository.create(article);

    return {
      id: article.getId(),
      title: article.getTitle(),
      content: article.getContent(),
      slug: article.getSlug(),
      author: {
        id: article.getAuthor().getId(),
        name: article.getAuthor().getName(),
        email: article.getAuthor().getEmail(),
      },
      createdAt: article.getCreatedAt(),
      updatedAt: article.getUpdatedAt(),
    };
  }
}

export interface CreateArticleInput {
  title: string;
  content: string;
}

export interface CreateArticleOutput {
  id: string;
  title: string;
  content: string;
  slug: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
