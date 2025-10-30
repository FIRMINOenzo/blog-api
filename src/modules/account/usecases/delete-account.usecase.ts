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
export class DeleteAccountUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(currentUser: AccountEntity, accountId: string): Promise<void> {
    if (
      !currentUser
        .getRole()
        ?.hasPermission(PermissionAction.DELETE, PermissionSubject.ACCOUNT)
    ) {
      throw new ForbiddenError('You are not allowed to delete accounts');
    }

    const account = await this.accountRepository.findById(new UUID(accountId));
    if (!account) {
      throw new NotFoundError(`Account with id '${accountId}' not found`);
    }
    if (account.getId() === currentUser.getId()) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    await this.accountRepository.delete(account);
  }
}
