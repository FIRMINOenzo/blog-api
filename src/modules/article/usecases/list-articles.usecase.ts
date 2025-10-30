import { Inject, Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { PermissionAction, PermissionSubject } from 'src/domain/value-objects';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import type { ArticleRepository } from 'src/domain/repositories/article.repository';
import {
  PaginatedResponse,
  PaginationMeta,
} from 'src/common/interfaces/paginated-response.interface';

export interface ListArticlesInput {
  page?: number;
  limit?: number;
}

@Injectable()
export class ListArticlesUseCase {
  constructor(
    @Inject('ArticleRepository')
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(
    currentUser: AccountEntity,
    input?: ListArticlesInput,
  ): Promise<PaginatedResponse<ListArticlesOutputItem>> {
    if (
      !currentUser
        .getRole()
        ?.hasPermission(PermissionAction.READ, PermissionSubject.ARTICLE)
    ) {
      throw new ForbiddenError('You are not allowed to read articles');
    }

    const page = input?.page || 1;
    const limit = input?.limit || 10;
    const skip = (page - 1) * limit;

    const { articles, total } = await this.articleRepository.findAllPaginated(
      skip,
      limit,
    );

    const data = articles.map((article) => ({
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
    }));

    const meta = new PaginationMeta(page, limit, total);

    return {
      data,
      meta: meta.toJSON(),
    };
  }
}

export interface ListArticlesOutputItem {
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
