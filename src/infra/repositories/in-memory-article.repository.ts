import { Injectable } from '@nestjs/common';
import { ArticleEntity } from 'src/domain/entities/article.entity';
import { ArticleRepository } from 'src/domain/repositories/article.repository';
import { UUID } from 'src/domain/value-objects';

@Injectable()
export class InMemoryArticleRepository implements ArticleRepository {
  private readonly articles: Map<string, ArticleEntity> = new Map();

  async create(article: ArticleEntity): Promise<void> {
    this.articles.set(article.getId(), article);
  }

  async findById(id: UUID): Promise<ArticleEntity | null> {
    return this.articles.get(id.getValue()) ?? null;
  }

  async findAll(): Promise<ArticleEntity[]> {
    return Array.from(this.articles.values());
  }

  async update(article: ArticleEntity): Promise<void> {
    this.articles.set(article.getId(), article);
  }

  async delete(article: ArticleEntity): Promise<void> {
    this.articles.delete(article.getId());
  }
}
