import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateAccountUseCase } from '../src/modules/account/usecases/update-account.usecase';
import { DbAccountRepository } from '../src/infra/repositories/db-account.repository';
import { DbRoleRepository } from '../src/infra/repositories/db-role.repository';
import { HashPasswordService } from '../src/infra/services/hash-password.service';
import { DbAccountEntity } from '../src/infra/database/entities/db-account.entity';
import { DbRoleEntity } from '../src/infra/database/entities/db-role.entity';
import { AccountEntity } from '../src/domain/entities/account.entity';
import { ForbiddenError } from '../src/domain/errors/forbidden.error';
import { AppDataSource } from '../src/infra/database/data-source';

describe('UpdateAccountUseCase - Integration', () => {
  let useCase: UpdateAccountUseCase;
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
        UpdateAccountUseCase,
        {
          provide: 'AccountRepository',
          useClass: DbAccountRepository,
        },
        {
          provide: 'RoleRepository',
          useClass: DbRoleRepository,
        },
        HashPasswordService,
      ],
    }).compile();

    useCase = module.get<UpdateAccountUseCase>(UpdateAccountUseCase);
    accountRepository = module.get('AccountRepository');
    roleRepository = module.get('RoleRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should update an account successfully when user has permission', async () => {
    const adminRole = await roleRepository.findByName('ADMIN');
    const editorRole = await roleRepository.findByName('EDITOR');
    if (!adminRole || !editorRole) {
      throw new Error('Roles not found. Run migrations first!');
    }

    const admin = new AccountEntity(
      crypto.randomUUID(),
      'Admin User',
      'admin-update@test.com',
      'hashed123',
      new Date(),
      new Date(),
      adminRole,
    );
    await accountRepository.create(admin);

    const targetUser = new AccountEntity(
      crypto.randomUUID(),
      'Original Name',
      'target-update@test.com',
      'hashed456',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(targetUser);

    const updateDto = {
      name: 'Updated Name',
      email: 'updated-email@test.com',
    };

    const result = await useCase.execute(admin, targetUser.getId(), updateDto);

    expect(result.id).toBe(targetUser.getId());
    expect(result.name).toBe('Updated Name');
    expect(result.email).toBe('updated-email@test.com');
    expect(result.updatedAt.getTime()).toBeGreaterThan(
      targetUser.getCreatedAt().getTime(),
    );
  });

  it('should throw ForbiddenError when user does not have permission', async () => {
    const editorRole = await roleRepository.findByName('EDITOR');
    if (!editorRole) {
      throw new Error('EDITOR role not found. Run migrations first!');
    }

    const editor1 = new AccountEntity(
      crypto.randomUUID(),
      'Editor One',
      'editor1-update@test.com',
      'hashed123',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(editor1);

    const editor2 = new AccountEntity(
      crypto.randomUUID(),
      'Editor Two',
      'editor2-update@test.com',
      'hashed456',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(editor2);

    const updateDto = {
      name: 'Hacked Name',
    };

    await expect(
      useCase.execute(editor1, editor2.getId(), updateDto),
    ).rejects.toThrow(
      new ForbiddenError('You are not allowed to update accounts'),
    );
  });
});
