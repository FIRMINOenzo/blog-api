import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from 'src/domain/entities/article.entity';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { ArticleRepository } from 'src/domain/repositories/article.repository';
import { DbArticleEntity } from '../database/entities/db-article.entity';
import { Slug, UUID } from 'src/domain/value-objects';

@Injectable()
export class DbArticleRepository implements ArticleRepository {
  constructor(
    @InjectRepository(DbArticleEntity)
    private readonly repository: Repository<DbArticleEntity>,
  ) {}

  async create(article: ArticleEntity): Promise<void> {
    const dbArticle = new DbArticleEntity();
    dbArticle.id = article.getId();
    dbArticle.title = article.getTitle();
    dbArticle.content = article.getContent();
    dbArticle.slug = article.getSlug();
    dbArticle.authorId = article.getAuthor().getId();
    dbArticle.createdAt = article.getCreatedAt();
    dbArticle.updatedAt = article.getUpdatedAt();
    dbArticle.isDeleted = false;
    await this.repository.save(dbArticle);
  }

  async findById(id: UUID): Promise<ArticleEntity | null> {
    const dbArticle = await this.repository.findOne({
      where: { id: id.getValue(), isDeleted: false },
      relations: ['author'],
    });
    if (!dbArticle) return null;
    return this.mapToEntity(dbArticle);
  }

  async findBySlug(slug: Slug): Promise<ArticleEntity | null> {
    const dbArticle = await this.repository.findOne({
      where: { slug: slug.getValue(), isDeleted: false },
      relations: ['author'],
    });
    if (!dbArticle) return null;
    return this.mapToEntity(dbArticle);
  }

  async findAll(): Promise<ArticleEntity[]> {
    const dbArticles = await this.repository.find({
      where: { isDeleted: false },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
    return dbArticles.map((dbArticle) => this.mapToEntity(dbArticle));
  }

  async findAllPaginated(
    skip: number,
    take: number,
  ): Promise<{ articles: ArticleEntity[]; total: number }> {
    const [dbArticles, total] = await this.repository.findAndCount({
      where: { isDeleted: false },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    const articles = dbArticles.map((dbArticle) => this.mapToEntity(dbArticle));
    return { articles, total };
  }

  async update(article: ArticleEntity): Promise<void> {
    const dbArticle = new DbArticleEntity();
    dbArticle.id = article.getId();
    dbArticle.title = article.getTitle();
    dbArticle.content = article.getContent();
    dbArticle.slug = article.getSlug();
    dbArticle.authorId = article.getAuthor().getId();
    dbArticle.updatedAt = article.getUpdatedAt();
    await this.repository.save(dbArticle);
  }

  async delete(id: UUID): Promise<void> {
    await this.repository.update(
      { id: id.getValue() },
      { isDeleted: true, updatedAt: new Date() },
    );
  }

  private mapToEntity(dbArticle: DbArticleEntity): ArticleEntity {
    const author = new AccountEntity(
      dbArticle.author.id,
      dbArticle.author.name,
      dbArticle.author.email,
      dbArticle.author.password,
      dbArticle.author.createdAt,
      dbArticle.author.updatedAt,
      undefined,
    );

    return new ArticleEntity(
      dbArticle.id,
      dbArticle.title,
      dbArticle.content,
      dbArticle.createdAt,
      dbArticle.updatedAt,
      author,
    );
  }
}
