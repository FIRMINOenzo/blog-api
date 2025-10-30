import { Inject, Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { NotFoundError } from 'src/domain/errors/not-found.error';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import {
  PermissionAction,
  PermissionSubject,
  UUID,
} from 'src/domain/value-objects';
import type { ArticleRepository } from 'src/domain/repositories/article.repository';

@Injectable()
export class GetArticleByIdUseCase {
  constructor(
    @Inject('ArticleRepository')
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(
    currentUser: AccountEntity,
    id: string,
  ): Promise<GetArticleByIdOutput> {
    if (
      !currentUser
        .getRole()
        ?.hasPermission(PermissionAction.READ, PermissionSubject.ARTICLE)
    ) {
      throw new ForbiddenError('You are not allowed to read articles');
    }

    const article = await this.articleRepository.findById(new UUID(id));

    if (!article) {
      throw new NotFoundError(`Article with id '${id}' not found`);
    }

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

export interface GetArticleByIdOutput {
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
