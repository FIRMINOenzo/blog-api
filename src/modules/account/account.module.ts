import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { CreateAccountUseCase } from './usecases/create-account.usecase';
import { ListAccountsUseCase } from './usecases/list-accounts.usecase';
import { GetAccountByIdUseCase } from './usecases/get-account-by-id.usecase';
import { UpdateAccountUseCase } from './usecases/update-account.usecase';
import { DeleteAccountUseCase } from './usecases/delete-account.usecase';
import { HashPasswordService } from 'src/infra/services/hash-password.service';
import { DbAccountRepository } from 'src/infra/repositories/db-account.repository';
import { DbRoleRepository } from 'src/infra/repositories/db-role.repository';
import { DbAccountEntity } from 'src/infra/database/entities/db-account.entity';
import { DbRoleEntity } from 'src/infra/database/entities/db-role.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([DbAccountEntity, DbRoleEntity]),
  ],
  controllers: [AccountController],
  providers: [
    CreateAccountUseCase,
    ListAccountsUseCase,
    GetAccountByIdUseCase,
    UpdateAccountUseCase,
    DeleteAccountUseCase,
    HashPasswordService,
    {
      provide: 'AccountRepository',
      useClass: DbAccountRepository,
    },
    {
      provide: 'RoleRepository',
      useClass: DbRoleRepository,
    },
  ],
  exports: [
    'AccountRepository',
    'RoleRepository',
    HashPasswordService,
    CreateAccountUseCase,
  ],
})
export class AccountModule {}
