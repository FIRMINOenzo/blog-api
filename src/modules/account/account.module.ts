import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AccountController } from './account.controller';
import { CreateAccountUseCase } from './usecases/create-account.usecase';
import { HashPasswordService } from 'src/infra/services/hash-password.service';
import { InMemoryAccountRepository } from 'src/infra/repositories/in-memory-account.repository';
import { InMemoryRoleRepository } from 'src/infra/repositories/in-memory-role.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AccountController],
  providers: [
    CreateAccountUseCase,
    HashPasswordService,
    {
      provide: 'AccountRepository',
      useClass: InMemoryAccountRepository,
    },
    {
      provide: 'RoleRepository',
      useClass: InMemoryRoleRepository,
    },
    InMemoryRoleRepository,
  ],
})
export class AccountModule {}
