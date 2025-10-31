import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListAccountsUseCase } from '../src/modules/account/usecases/list-accounts.usecase';
import { DbAccountRepository } from '../src/infra/repositories/db-account.repository';
import { DbRoleRepository } from '../src/infra/repositories/db-role.repository';
import { DbAccountEntity } from '../src/infra/database/entities/db-account.entity';
import { DbRoleEntity } from '../src/infra/database/entities/db-role.entity';
import { AccountEntity } from '../src/domain/entities/account.entity';
import { ForbiddenError } from '../src/domain/errors/forbidden.error';
import { AppDataSource } from '../src/infra/database/data-source';

describe('ListAccountsUseCase - Integration', () => {
  let useCase: ListAccountsUseCase;
  let accountRepository: DbAccountRepository;
  let roleRepository: DbRoleRepository;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...AppDataSource.options,
          synchronize: false,
        }),
        TypeOrmModule.forFeature([DbAccountEntity, DbRoleEntity]),
      ],
      providers: [
        ListAccountsUseCase,
        {
          provide: 'AccountRepository',
          useClass: DbAccountRepository,
        },
        {
          provide: 'RoleRepository',
          useClass: DbRoleRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListAccountsUseCase>(ListAccountsUseCase);
    accountRepository = module.get('AccountRepository');
    roleRepository = module.get('RoleRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should list accounts with pagination when user has permission', async () => {
    const adminRole = await roleRepository.findByName('ADMIN');
    if (!adminRole) {
      throw new Error('ADMIN role not found. Run migrations first!');
    }

    const admin = new AccountEntity(
      crypto.randomUUID(),
      'Admin User',
      'admin-list@test.com',
      'hashed123',
      new Date(),
      new Date(),
      adminRole,
    );
    await accountRepository.create(admin);

    for (let i = 1; i <= 3; i++) {
      const user = new AccountEntity(
        crypto.randomUUID(),
        `User ${i}`,
        `user${i}-list@test.com`,
        'hashed456',
        new Date(),
        new Date(),
        adminRole,
      );
      await accountRepository.create(user);
    }

    const result = await useCase.execute(admin, { page: 1, limit: 2 });

    expect(result.data).toHaveLength(2);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(2);
    expect(result.meta.total).toBeGreaterThanOrEqual(4);
    expect(result.meta.totalPages).toBeGreaterThanOrEqual(2);
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.meta.hasPreviousPage).toBe(false);
  });

  it('should throw ForbiddenError when user does not have permission', async () => {
    const readerRole = await roleRepository.findByName('READER');
    if (!readerRole) {
      throw new Error('READER role not found. Run migrations first!');
    }

    const reader = new AccountEntity(
      crypto.randomUUID(),
      'Reader User',
      'reader-list@test.com',
      'hashed789',
      new Date(),
      new Date(),
      readerRole,
    );
    await accountRepository.create(reader);

    await expect(
      useCase.execute(reader, { page: 1, limit: 10 }),
    ).rejects.toThrow(
      new ForbiddenError('You are not allowed to list accounts'),
    );
  });
});
