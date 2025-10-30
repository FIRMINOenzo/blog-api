import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AccountDto, PaginatedAccountsResponseDto } from './dto/account.dto';

@ApiTags('Accounts')
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: AccountDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(
    @Body() input: CreateAccountDto,
    @CurrentUser() currentUser: AccountEntity,
  ) {
    return this.createAccountUseCase.execute(currentUser, input);
  }

  @Get()
  @ApiOperation({ summary: 'List all accounts (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'List of accounts retrieved',
    type: PaginatedAccountsResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @CurrentUser() currentUser: AccountEntity,
    @Query() pagination: PaginationDto,
  ) {
    return this.listAccountsUseCase.execute(currentUser, {
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({
    status: 200,
    description: 'Account found',
    type: AccountDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: AccountEntity,
  ) {
    return this.getAccountByIdUseCase.execute(currentUser, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
    type: AccountDto,
  })
  async update(
    @Param('id') id: string,
    @Body() input: UpdateAccountDto,
    @CurrentUser() currentUser: AccountEntity,
  ) {
    return this.updateAccountUseCase.execute(currentUser, id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete account (soft delete)' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: AccountEntity,
  ) {
    await this.deleteAccountUseCase.execute(currentUser, id);
  }
}
