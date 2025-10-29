import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateAccountUseCase } from './usecases/create-account.usecase';
import { CreateAccountDto } from './dto/create-account.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly createAccountUseCase: CreateAccountUseCase) {}

  @Post()
  async create(
    @Body() input: CreateAccountDto,
    @CurrentUser() currentUser: AccountEntity,
  ) {
    return this.createAccountUseCase.execute(currentUser, input);
  }
}
