import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { CreateArticleUseCase } from './usecases/create-article.usecase';
import { ListArticlesUseCase } from './usecases/list-articles.usecase';
import { GetArticleByIdUseCase } from './usecases/get-article-by-id.usecase';
import { GetArticleBySlugUseCase } from './usecases/get-article-by-slug.usecase';
import { UpdateArticleUseCase } from './usecases/update-article.usecase';
import { DeleteArticleUseCase } from './usecases/delete-article.usecase';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
@UseGuards(JwtAuthGuard)
export class ArticleController {
  constructor(
    private readonly createArticleUseCase: CreateArticleUseCase,
    private readonly listArticlesUseCase: ListArticlesUseCase,
    private readonly getArticleByIdUseCase: GetArticleByIdUseCase,
    private readonly getArticleBySlugUseCase: GetArticleBySlugUseCase,
    private readonly updateArticleUseCase: UpdateArticleUseCase,
    private readonly deleteArticleUseCase: DeleteArticleUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() currentUser: AccountEntity,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.createArticleUseCase.execute(currentUser, createArticleDto);
  }

  @Get()
  async list(@CurrentUser() currentUser: AccountEntity) {
    return this.listArticlesUseCase.execute(currentUser);
  }

  @Get('slug/:slug')
  async getBySlug(
    @CurrentUser() currentUser: AccountEntity,
    @Param('slug') slug: string,
  ) {
    return this.getArticleBySlugUseCase.execute(currentUser, slug);
  }

  @Get(':id')
  async getById(
    @CurrentUser() currentUser: AccountEntity,
    @Param('id') id: string,
  ) {
    return this.getArticleByIdUseCase.execute(currentUser, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() currentUser: AccountEntity,
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.updateArticleUseCase.execute(currentUser, id, updateArticleDto);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() currentUser: AccountEntity,
    @Param('id') id: string,
  ) {
    return this.deleteArticleUseCase.execute(currentUser, id);
  }
}
