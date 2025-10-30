import { ArticleEntity } from '../entities/article.entity';
import { UUID } from '../value-objects';

export interface ArticleRepository {
  create(article: ArticleEntity): Promise<void>;
  findById(id: UUID): Promise<ArticleEntity | null>;
  findAll(): Promise<ArticleEntity[]>;
  update(article: ArticleEntity): Promise<void>;
  delete(article: ArticleEntity): Promise<void>;
}
