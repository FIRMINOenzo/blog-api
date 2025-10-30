import { ArticleEntity } from '../entities/article.entity';
import { Slug, UUID } from '../value-objects';

export interface ArticleRepository {
  create(article: ArticleEntity): Promise<void>;
  findById(id: UUID): Promise<ArticleEntity | null>;
  findBySlug(slug: Slug): Promise<ArticleEntity | null>;
  findAll(): Promise<ArticleEntity[]>;
  findAllPaginated(
    skip: number,
    take: number,
  ): Promise<{ articles: ArticleEntity[]; total: number }>;
  update(article: ArticleEntity): Promise<void>;
  delete(id: UUID): Promise<void>;
}
