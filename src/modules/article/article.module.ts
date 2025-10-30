import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article.controller';
import { CreateArticleUseCase } from './usecases/create-article.usecase';
import { DbArticleEntity } from 'src/infra/database/entities/db-article.entity';
import { DbArticleRepository } from 'src/infra/repositories/db-article.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DbArticleEntity])],
  controllers: [ArticleController],
  providers: [
    CreateArticleUseCase,
    {
      provide: 'ArticleRepository',
      useClass: DbArticleRepository,
    },
  ],
})
export class ArticleModule {}
