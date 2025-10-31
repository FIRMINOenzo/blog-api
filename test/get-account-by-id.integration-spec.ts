import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetAccountByIdUseCase } from '../src/modules/account/usecases/get-account-by-id.usecase';
import { DbAccountRepository } from '../src/infra/repositories/db-account.repository';
import { DbRoleRepository } from '../src/infra/repositories/db-role.repository';
import { DbAccountEntity } from '../src/infra/database/entities/db-account.entity';
import { DbRoleEntity } from '../src/infra/database/entities/db-role.entity';
import { AccountEntity } from '../src/domain/entities/account.entity';
import { ForbiddenError } from '../src/domain/errors/forbidden.error';
import { AppDataSource } from '../src/infra/database/data-source';

describe('GetAccountByIdUseCase - Integration', () => {
  let useCase: GetAccountByIdUseCase;
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
        GetAccountByIdUseCase,
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

    useCase = module.get<GetAccountByIdUseCase>(GetAccountByIdUseCase);
    accountRepository = module.get('AccountRepository');
    roleRepository = module.get('RoleRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should get account by id when user has permission', async () => {
    const adminRole = await roleRepository.findByName('ADMIN');
    if (!adminRole) {
      throw new Error('ADMIN role not found. Run migrations first!');
    }

    const admin = new AccountEntity(
      crypto.randomUUID(),
      'Admin Get',
      'admin-get@test.com',
      'hashed123',
      new Date(),
      new Date(),
      adminRole,
    );
    await accountRepository.create(admin);

    const targetUser = new AccountEntity(
      crypto.randomUUID(),
      'Target User',
      'target-get@test.com',
      'hashed456',
      new Date(),
      new Date(),
      adminRole,
    );
    await accountRepository.create(targetUser);

    const result = await useCase.execute(admin, targetUser.getId());

    expect(result.id).toBe(targetUser.getId());
    expect(result.name).toBe('Target User');
    expect(result.email).toBe('target-get@test.com');
    expect(result.role.name).toBe('ADMIN');
  });

  it('should throw ForbiddenError when user does not have permission', async () => {
    const editorRole = await roleRepository.findByName('EDITOR');
    if (!editorRole) {
      throw new Error('EDITOR role not found. Run migrations first!');
    }

    const editor = new AccountEntity(
      crypto.randomUUID(),
      'Editor Get',
      'editor-get@test.com',
      'hashed789',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(editor);

    const anotherUser = new AccountEntity(
      crypto.randomUUID(),
      'Another User',
      'another-get@test.com',
      'hashed101',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(anotherUser);

    await expect(useCase.execute(editor, anotherUser.getId())).rejects.toThrow(
      new ForbiddenError('You are not allowed to read accounts'),
    );
  });
});
