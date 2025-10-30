import { Inject, Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import { NotFoundError } from 'src/domain/errors/not-found.error';
import { ConflictError } from 'src/domain/errors/conflict.error';
import {
  PermissionAction,
  PermissionSubject,
  UUID,
} from 'src/domain/value-objects';
import type { AccountRepository } from 'src/domain/repositories/account.repository';
import type { RoleRepository } from 'src/domain/repositories/role.repository';
import { HashPasswordService } from 'src/infra/services/hash-password.service';

@Injectable()
export class UpdateAccountUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
    private readonly hashPasswordService: HashPasswordService,
  ) {}

  async execute(
    currentUser: AccountEntity,
    accountId: string,
    input: UpdateAccountInput,
  ): Promise<UpdateAccountOutput> {
    if (
      !currentUser
        .getRole()
        ?.hasPermission(PermissionAction.UPDATE, PermissionSubject.ACCOUNT)
    ) {
      throw new ForbiddenError('You are not allowed to update accounts');
    }

    const account = await this.accountRepository.findById(new UUID(accountId));
    if (!account) {
      throw new NotFoundError(`Account with id '${accountId}' not found`);
    }

    if (input.email && input.email !== account.getEmail()) {
      const existingAccount = await this.accountRepository.findByEmail(
        input.email,
      );
      if (existingAccount && existingAccount.getId() !== accountId) {
        throw new ConflictError(
          `Account with email '${input.email}' already exists`,
        );
      }
    }

    let role = account.getRole();
    if (input.roleId) {
      const newRole = await this.roleRepository.findById(
        new UUID(input.roleId),
      );
      if (!newRole) {
        throw new NotFoundError('Role not found');
      }
      role = newRole;
    }

    let password = account.getPassword();
    if (input.password) {
      password = await this.hashPasswordService.hash(input.password);
    }

    const updatedAccount = new AccountEntity(
      account.getId(),
      input.name ?? account.getName(),
      input.email ?? account.getEmail(),
      password,
      account.getCreatedAt(),
      new Date(),
      role ?? undefined,
    );

    await this.accountRepository.update(updatedAccount);

    return {
      id: updatedAccount.getId(),
      name: updatedAccount.getName(),
      email: updatedAccount.getEmail(),
      role: {
        id: updatedAccount.getRole()!.getId(),
        name: updatedAccount.getRole()!.getName(),
      },
      createdAt: updatedAccount.getCreatedAt(),
      updatedAt: updatedAccount.getUpdatedAt(),
    };
  }
}

export interface UpdateAccountInput {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
}

export interface UpdateAccountOutput {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
