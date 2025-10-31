import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteAccountUseCase } from '../src/modules/account/usecases/delete-account.usecase';
import { DbAccountRepository } from '../src/infra/repositories/db-account.repository';
import { DbRoleRepository } from '../src/infra/repositories/db-role.repository';
import { DbAccountEntity } from '../src/infra/database/entities/db-account.entity';
import { DbRoleEntity } from '../src/infra/database/entities/db-role.entity';
import { AccountEntity } from '../src/domain/entities/account.entity';
import { ForbiddenError } from '../src/domain/errors/forbidden.error';
import { UUID } from '../src/domain/value-objects';
import { AppDataSource } from '../src/infra/database/data-source';

describe('DeleteAccountUseCase - Integration', () => {
  let useCase: DeleteAccountUseCase;
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
        DeleteAccountUseCase,
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

    useCase = module.get<DeleteAccountUseCase>(DeleteAccountUseCase);
    accountRepository = module.get('AccountRepository');
    roleRepository = module.get('RoleRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should delete an account successfully when user has permission', async () => {
    const adminRole = await roleRepository.findByName('ADMIN');
    const editorRole = await roleRepository.findByName('EDITOR');
    if (!adminRole || !editorRole) {
      throw new Error('Roles not found. Run migrations first!');
    }

    const admin = new AccountEntity(
      crypto.randomUUID(),
      'Admin User',
      'admin-delete@test.com',
      'hashed123',
      new Date(),
      new Date(),
      adminRole,
    );
    await accountRepository.create(admin);

    const targetUser = new AccountEntity(
      crypto.randomUUID(),
      'Target User',
      'target@test.com',
      'hashed456',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(targetUser);

    await useCase.execute(admin, targetUser.getId());

    const deletedUser = await accountRepository.findById(
      new UUID(targetUser.getId()),
    );
    expect(deletedUser).toBeNull();
  });

  it('should throw ForbiddenError when user does not have permission', async () => {
    const editorRole = await roleRepository.findByName('EDITOR');
    if (!editorRole) {
      throw new Error('EDITOR role not found. Run migrations first!');
    }

    const editor = new AccountEntity(
      crypto.randomUUID(),
      'Editor User',
      'editor-no-perm@test.com',
      'hashed123',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(editor);

    const anotherEditor = new AccountEntity(
      crypto.randomUUID(),
      'Another Editor',
      'another-editor@test.com',
      'hashed456',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(anotherEditor);

    await expect(
      useCase.execute(editor, anotherEditor.getId()),
    ).rejects.toThrow(
      new ForbiddenError('You are not allowed to delete accounts'),
    );
  });
});

