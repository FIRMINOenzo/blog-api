import { Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { AccountRepository } from 'src/domain/repositories/account.repository';

@Injectable()
export class InMemoryAccountRepository implements AccountRepository {
  private readonly accounts: Map<string, AccountEntity> = new Map();

  create(account: AccountEntity): Promise<void> {
    this.accounts.set(account.getId(), account);
    return Promise.resolve();
  }

  findById(id: string): Promise<AccountEntity | null> {
    return Promise.resolve(this.accounts.get(id) ?? null);
  }

  findByEmail(email: string): Promise<AccountEntity | null> {
    for (const account of this.accounts.values()) {
      if (account.getEmail() === email) {
        return Promise.resolve(account);
      }
    }
    return Promise.resolve(null);
  }

  update(account: AccountEntity): Promise<void> {
    this.accounts.set(account.getId(), account);
    return Promise.resolve();
  }

  delete(account: AccountEntity): Promise<void> {
    this.accounts.delete(account.getId());
    return Promise.resolve();
  }
}
