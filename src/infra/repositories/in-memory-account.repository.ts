import { Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { AccountRepository } from 'src/domain/repositories/account.repository';
import { UUID } from 'src/domain/value-objects';

@Injectable()
export class InMemoryAccountRepository implements AccountRepository {
  private readonly accounts: Map<string, AccountEntity> = new Map();

  create(account: AccountEntity): Promise<void> {
    this.accounts.set(account.getId(), account);
    return Promise.resolve();
  }

  findById(id: UUID): Promise<AccountEntity | null> {
    return Promise.resolve(this.accounts.get(id.getValue()) ?? null);
  }

  findByEmail(email: string): Promise<AccountEntity | null> {
    for (const account of this.accounts.values()) {
      if (account.getEmail() === email) {
        return Promise.resolve(account);
      }
    }
    return Promise.resolve(null);
  }

  findAll(): Promise<AccountEntity[]> {
    return Promise.resolve(Array.from(this.accounts.values()));
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
