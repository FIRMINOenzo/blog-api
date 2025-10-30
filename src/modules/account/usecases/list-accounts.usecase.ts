import { Inject, Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import { PermissionAction, PermissionSubject } from 'src/domain/value-objects';
import type { AccountRepository } from 'src/domain/repositories/account.repository';

@Injectable()
export class ListAccountsUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(currentUser: AccountEntity): Promise<ListAccountsOutput> {
    if (
      !currentUser
        .getRole()
        ?.hasPermission(PermissionAction.READ, PermissionSubject.ACCOUNT)
    ) {
      throw new ForbiddenError('You are not allowed to list accounts');
    }

    const accounts = await this.accountRepository.findAll();

    return {
      accounts: accounts.map((account) => ({
        id: account.getId(),
        name: account.getName(),
        email: account.getEmail(),
        role: {
          id: account.getRole()!.getId(),
          name: account.getRole()!.getName(),
        },
        createdAt: account.getCreatedAt(),
        updatedAt: account.getUpdatedAt(),
      })),
      total: accounts.length,
    };
  }
}

export interface ListAccountsOutput {
  accounts: Array<{
    id: string;
    name: string;
    email: string;
    role: {
      id: string;
      name: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
}
