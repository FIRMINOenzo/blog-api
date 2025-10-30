import { Inject, Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import { NotFoundError } from 'src/domain/errors/not-found.error';
import { UUID } from 'src/domain/value-objects';
import type { ArticleRepository } from 'src/domain/repositories/article.repository';

@Injectable()
export class DeleteArticleUseCase {
  constructor(
    @Inject('ArticleRepository')
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(currentUser: AccountEntity, articleId: string): Promise<void> {
    const id = new UUID(articleId);
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new NotFoundError(`Article with id '${articleId}' not found`);
    }

    if (!article.canBeDeletedBy(currentUser)) {
      throw new ForbiddenError('You are not allowed to delete this article');
    }

    await this.articleRepository.delete(id);
  }
}
