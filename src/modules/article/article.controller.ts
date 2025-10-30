import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { CreateArticleUseCase } from './usecases/create-article.usecase';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
@UseGuards(JwtAuthGuard)
export class ArticleController {
  constructor(private readonly createArticleUseCase: CreateArticleUseCase) {}

  @Post()
  async create(
    @CurrentUser() currentUser: AccountEntity,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.createArticleUseCase.execute(currentUser, createArticleDto);
  }
}
