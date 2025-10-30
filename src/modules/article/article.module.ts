import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article.controller';
import { CreateArticleUseCase } from './usecases/create-article.usecase';
import { ListArticlesUseCase } from './usecases/list-articles.usecase';
import { GetArticleByIdUseCase } from './usecases/get-article-by-id.usecase';
import { GetArticleBySlugUseCase } from './usecases/get-article-by-slug.usecase';
import { UpdateArticleUseCase } from './usecases/update-article.usecase';
import { DeleteArticleUseCase } from './usecases/delete-article.usecase';
import { DbArticleEntity } from 'src/infra/database/entities/db-article.entity';
import { DbArticleRepository } from 'src/infra/repositories/db-article.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DbArticleEntity])],
  controllers: [ArticleController],
  providers: [
    CreateArticleUseCase,
    ListArticlesUseCase,
    GetArticleByIdUseCase,
    GetArticleBySlugUseCase,
    UpdateArticleUseCase,
    DeleteArticleUseCase,
    {
      provide: 'ArticleRepository',
      useClass: DbArticleRepository,
    },
  ],
})
export class ArticleModule {}
