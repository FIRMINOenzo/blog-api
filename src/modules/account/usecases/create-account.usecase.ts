import { AccountEntity } from 'src/domain/entities/account.entity';
import { NotFoundError } from 'src/domain/errors/not-found.error';
import { Password } from 'src/domain/value-objects';
import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import { HashPasswordService } from 'src/infra/services/hash-password.service';
import type { AccountRepository } from 'src/domain/repositories/account.repository';
import type { RoleRepository } from 'src/domain/repositories/role.repository';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
    private readonly jwtService: JwtService,
    private readonly hashPasswordService: HashPasswordService,
  ) {}

  async execute(
    account: AccountEntity,
    input: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    const existingAccount = await this.accountRepository.findByEmail(
      input.email,
    );
    if (existingAccount) throw new Error('Account already exists');

    const role = await this.roleRepository.findById(input.roleId);
    if (!role) throw new NotFoundError('Role not found');

    const password = new Password(input.password);
    const hashedPassword = await this.hashPasswordService.hash(
      password.getValue(),
    );

    const createdAccount = AccountEntity.create(
      account,
      input.name,
      input.email,
      hashedPassword,
      role,
    );
    await this.accountRepository.create(createdAccount);
    const token = await this.jwtService.signAsync({});
    return { token };
  }
}

export class CreateAccountInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly roleId: string;
}

export class CreateAccountOutput {
  readonly token: string;
}
