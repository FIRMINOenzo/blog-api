import { Inject, Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import { NotFoundError } from 'src/domain/errors/not-found.error';
import {
  PermissionAction,
  PermissionSubject,
  UUID,
} from 'src/domain/value-objects';
import type { AccountRepository } from 'src/domain/repositories/account.repository';

@Injectable()
export class GetAccountByIdUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(
    currentUser: AccountEntity,
    accountId: string,
  ): Promise<GetAccountByIdOutput> {
    if (
      !currentUser
        .getRole()
        ?.hasPermission(PermissionAction.READ, PermissionSubject.ACCOUNT)
    ) {
      throw new ForbiddenError('You are not allowed to read accounts');
    }

    const account = await this.accountRepository.findById(new UUID(accountId));

    if (!account) {
      throw new NotFoundError(`Account with id '${accountId}' not found`);
    }

    return {
      id: account.getId(),
      name: account.getName(),
      email: account.getEmail(),
      role: {
        id: account.getRole()!.getId(),
        name: account.getRole()!.getName(),
      },
      createdAt: account.getCreatedAt(),
      updatedAt: account.getUpdatedAt(),
    };
  }
}

export interface GetAccountByIdOutput {
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
