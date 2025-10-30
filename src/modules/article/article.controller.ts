import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ArticleDto, PaginatedArticlesResponseDto } from './dto/article.dto';

@ApiTags('Articles')
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
    type: ArticleDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async create(
    @CurrentUser() currentUser: AccountEntity,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.createArticleUseCase.execute(currentUser, createArticleDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all articles (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'List of articles retrieved',
    type: PaginatedArticlesResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async list(
    @CurrentUser() currentUser: AccountEntity,
    @Query() pagination: PaginationDto,
  ) {
    return this.listArticlesUseCase.execute(currentUser, {
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get article by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Article slug',
    example: 'my-article-title',
  })
  @ApiResponse({ status: 200, description: 'Article found', type: ArticleDto })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getBySlug(
    @CurrentUser() currentUser: AccountEntity,
    @Param('slug') slug: string,
  ) {
    return this.getArticleBySlugUseCase.execute(currentUser, slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Article found', type: ArticleDto })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getById(
    @CurrentUser() currentUser: AccountEntity,
    @Param('id') id: string,
  ) {
    return this.getArticleByIdUseCase.execute(currentUser, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update article' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({
    status: 200,
    description: 'Article updated successfully',
    type: ArticleDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async update(
    @CurrentUser() currentUser: AccountEntity,
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.updateArticleUseCase.execute(currentUser, id, updateArticleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete article' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Article deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async delete(
    @CurrentUser() currentUser: AccountEntity,
    @Param('id') id: string,
  ) {
    return this.deleteArticleUseCase.execute(currentUser, id);
  }
}
