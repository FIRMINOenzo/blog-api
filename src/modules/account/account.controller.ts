import { Body, Controller, Post } from '@nestjs/common';
import { CreateAccountUseCase } from './usecases/create-account.usecase';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from 'src/domain/value-objects';

@Controller('accounts')
export class AccountController {
  constructor(private readonly createAccountUseCase: CreateAccountUseCase) {}

  @Post()
  async create(@Body() input: CreateAccountDto) {
    const mockAdminAccount = new AccountEntity(
      crypto.randomUUID(),
      'Admin',
      'admin@example.com',
      'hashed_password',
      new Date(),
      new Date(),
      new RoleEntity(crypto.randomUUID(), 'ADMIN', [
        new Permission(PermissionAction.CREATE, PermissionSubject.ACCOUNT),
        new Permission(PermissionAction.READ, PermissionSubject.ACCOUNT),
        new Permission(PermissionAction.UPDATE, PermissionSubject.ACCOUNT),
        new Permission(PermissionAction.DELETE, PermissionSubject.ACCOUNT),
      ]),
    );

    return this.createAccountUseCase.execute(mockAdminAccount, input);
  }
}
