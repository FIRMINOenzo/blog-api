import { AccountEntity } from '../entities/account.entity';

export interface AccountRepository {
  create(account: AccountEntity): Promise<void>;
  findById(id: string): Promise<AccountEntity | null>;
  findByEmail(email: string): Promise<AccountEntity | null>;
  update(account: AccountEntity): Promise<void>;
  delete(account: AccountEntity): Promise<void>;
}
