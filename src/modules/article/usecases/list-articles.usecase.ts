import { Inject, Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { PermissionAction, PermissionSubject } from 'src/domain/value-objects';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import type { ArticleRepository } from 'src/domain/repositories/article.repository';

@Injectable()
export class ListArticlesUseCase {
  constructor(
    @Inject('ArticleRepository')
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(currentUser: AccountEntity): Promise<ListArticlesOutput> {
    if (
      !currentUser
        .getRole()
        ?.hasPermission(PermissionAction.READ, PermissionSubject.ARTICLE)
    ) {
      throw new ForbiddenError('You are not allowed to read articles');
    }

    const articles = await this.articleRepository.findAll();

    return {
      articles: articles.map((article) => ({
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
      })),
      total: articles.length,
    };
  }
}

export interface ListArticlesOutput {
  articles: Array<{
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
  }>;
  total: number;
}
