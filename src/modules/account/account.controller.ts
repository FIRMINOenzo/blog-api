import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateAccountUseCase } from './usecases/create-account.usecase';
import { ListAccountsUseCase } from './usecases/list-accounts.usecase';
import { GetAccountByIdUseCase } from './usecases/get-account-by-id.usecase';
import { UpdateAccountUseCase } from './usecases/update-account.usecase';
import { DeleteAccountUseCase } from './usecases/delete-account.usecase';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly listAccountsUseCase: ListAccountsUseCase,
    private readonly getAccountByIdUseCase: GetAccountByIdUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
  ) {}

  @Post()
  async create(
    @Body() input: CreateAccountDto,
    @CurrentUser() currentUser: AccountEntity,
  ) {
    return this.createAccountUseCase.execute(currentUser, input);
  }

  @Get()
  async findAll(@CurrentUser() currentUser: AccountEntity) {
    return this.listAccountsUseCase.execute(currentUser);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: AccountEntity,
  ) {
    return this.getAccountByIdUseCase.execute(currentUser, id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateAccountDto,
    @CurrentUser() currentUser: AccountEntity,
  ) {
    return this.updateAccountUseCase.execute(currentUser, id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: AccountEntity,
  ) {
    await this.deleteAccountUseCase.execute(currentUser, id);
  }
}
