import { Inject, Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { NotFoundError } from 'src/domain/errors/not-found.error';
import { UUID } from 'src/domain/value-objects';
import type { ArticleRepository } from 'src/domain/repositories/article.repository';

@Injectable()
export class UpdateArticleUseCase {
  constructor(
    @Inject('ArticleRepository')
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(
    currentUser: AccountEntity,
    articleId: string,
    input: UpdateArticleInput,
  ): Promise<UpdateArticleOutput> {
    const article = await this.articleRepository.findById(new UUID(articleId));

    if (!article) {
      throw new NotFoundError(`Article with id '${articleId}' not found`);
    }

    article.update(currentUser, input.title, input.content);
    await this.articleRepository.update(article);

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

export interface UpdateArticleInput {
  title?: string;
  content?: string;
}

export interface UpdateArticleOutput {
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
