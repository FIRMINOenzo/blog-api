import { Inject, Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import { PermissionAction, PermissionSubject } from 'src/domain/value-objects';
import type { AccountRepository } from 'src/domain/repositories/account.repository';
import {
  PaginatedResponse,
  PaginationMeta,
} from 'src/common/interfaces/paginated-response.interface';

export interface ListAccountsInput {
  page?: number;
  limit?: number;
}

@Injectable()
export class ListAccountsUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(
    currentUser: AccountEntity,
    input?: ListAccountsInput,
  ): Promise<PaginatedResponse<ListAccountsOutputItem>> {
    if (
      !currentUser
        .getRole()
        ?.hasPermission(PermissionAction.READ, PermissionSubject.ACCOUNT)
    ) {
      throw new ForbiddenError('You are not allowed to list accounts');
    }

    const page = input?.page || 1;
    const limit = input?.limit || 10;
    const skip = (page - 1) * limit;

    const { accounts, total } = await this.accountRepository.findAllPaginated(
      skip,
      limit,
    );

    const data = accounts.map((account) => ({
      id: account.getId(),
      name: account.getName(),
      email: account.getEmail(),
      role: {
        id: account.getRole()!.getId(),
        name: account.getRole()!.getName(),
      },
      createdAt: account.getCreatedAt(),
      updatedAt: account.getUpdatedAt(),
    }));

    const meta = new PaginationMeta(page, limit, total);

    return {
      data,
      meta: meta.toJSON(),
    };
  }
}

export interface ListAccountsOutputItem {
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
