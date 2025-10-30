import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import { AccountRepository } from 'src/domain/repositories/account.repository';
import { DbAccountEntity } from '../database/entities/db-account.entity';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
  UUID,
} from 'src/domain/value-objects';

@Injectable()
export class DbAccountRepository implements AccountRepository {
  constructor(
    @InjectRepository(DbAccountEntity)
    private readonly repository: Repository<DbAccountEntity>,
  ) {}

  async create(account: AccountEntity): Promise<void> {
    const dbAccount = new DbAccountEntity();
    dbAccount.id = account.getId();
    dbAccount.name = account.getName();
    dbAccount.email = account.getEmail();
    dbAccount.password = account.getPassword();
    dbAccount.roleId = account.getRole()!.getId();
    dbAccount.createdAt = account.getCreatedAt();
    dbAccount.updatedAt = account.getUpdatedAt();
    dbAccount.isDeleted = false;
    await this.repository.save(dbAccount);
  }

  async findById(id: UUID): Promise<AccountEntity | null> {
    const dbAccount = await this.repository.findOne({
      where: { id: id.getValue(), isDeleted: false },
      relations: ['role', 'role.permissions'],
    });
    if (!dbAccount) return null;
    return this.mapToEntity(dbAccount);
  }

  async findByEmail(email: string): Promise<AccountEntity | null> {
    const dbAccount = await this.repository.findOne({
      where: { email, isDeleted: false },
      relations: ['role', 'role.permissions'],
    });
    if (!dbAccount) return null;
    return this.mapToEntity(dbAccount);
  }

  async findAll(): Promise<AccountEntity[]> {
    const dbAccounts = await this.repository.find({
      where: { isDeleted: false },
      relations: ['role', 'role.permissions'],
      order: { createdAt: 'DESC' },
    });
    return dbAccounts.map((dbAccount) => this.mapToEntity(dbAccount));
  }

  async findAllPaginated(
    skip: number,
    take: number,
  ): Promise<{ accounts: AccountEntity[]; total: number }> {
    const [dbAccounts, total] = await this.repository.findAndCount({
      where: { isDeleted: false },
      relations: ['role', 'role.permissions'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    const accounts = dbAccounts.map((dbAccount) => this.mapToEntity(dbAccount));
    return { accounts, total };
  }

  private mapToEntity(dbAccount: DbAccountEntity): AccountEntity {
    const role = dbAccount.role
      ? new RoleEntity(
          dbAccount.role.id,
          dbAccount.role.name,
          dbAccount.role.permissions?.map(
            (p) =>
              new Permission(
                p.action as PermissionAction,
                p.subject as PermissionSubject,
              ),
          ),
        )
      : undefined;

    return new AccountEntity(
      dbAccount.id,
      dbAccount.name,
      dbAccount.email,
      dbAccount.password,
      dbAccount.createdAt,
      dbAccount.updatedAt,
      role,
    );
  }

  async update(account: AccountEntity): Promise<void> {
    const dbAccount = new DbAccountEntity();
    dbAccount.id = account.getId();
    dbAccount.updatedAt = account.getUpdatedAt();
    dbAccount.roleId = account.getRole()!.getId();
    dbAccount.name = account.getName();
    dbAccount.email = account.getEmail();
    dbAccount.password = account.getPassword();
    await this.repository.save(dbAccount);
  }

  async delete(account: AccountEntity): Promise<void> {
    await this.repository.update(
      { id: account.getId() },
      { isDeleted: true, updatedAt: account.getUpdatedAt() },
    );
  }
}
