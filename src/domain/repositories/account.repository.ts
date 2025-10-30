import { AccountEntity } from '../entities/account.entity';
import { UUID } from '../value-objects';

export interface AccountRepository {
  create(account: AccountEntity): Promise<void>;
  findById(id: UUID): Promise<AccountEntity | null>;
  findByEmail(email: string): Promise<AccountEntity | null>;
  findAll(): Promise<AccountEntity[]>;
  findAllPaginated(
    skip: number,
    take: number,
  ): Promise<{ accounts: AccountEntity[]; total: number }>;
  update(account: AccountEntity): Promise<void>;
  delete(account: AccountEntity): Promise<void>;
}
