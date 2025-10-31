import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateAccountUseCase } from '../src/modules/account/usecases/create-account.usecase';
import { DbAccountRepository } from '../src/infra/repositories/db-account.repository';
import { DbRoleRepository } from '../src/infra/repositories/db-role.repository';
import { HashPasswordService } from '../src/infra/services/hash-password.service';
import { DbAccountEntity } from '../src/infra/database/entities/db-account.entity';
import { DbRoleEntity } from '../src/infra/database/entities/db-role.entity';
import { AccountEntity } from '../src/domain/entities/account.entity';
import { ForbiddenError } from '../src/domain/errors/forbidden.error';
import { AppDataSource } from '../src/infra/database/data-source';

describe('CreateAccountUseCase - Integration', () => {
  let useCase: CreateAccountUseCase;
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
        CreateAccountUseCase,
        {
          provide: 'AccountRepository',
          useClass: DbAccountRepository,
        },
        {
          provide: 'RoleRepository',
          useClass: DbRoleRepository,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
        HashPasswordService,
      ],
    }).compile();

    useCase = module.get<CreateAccountUseCase>(CreateAccountUseCase);
    accountRepository = module.get('AccountRepository');
    roleRepository = module.get('RoleRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should create an account successfully when user has permission', async () => {
    const adminRole = await roleRepository.findByName('ADMIN');
    if (!adminRole) {
      throw new Error('ADMIN role not found. Run migrations first!');
    }

    const editorRole = await roleRepository.findByName('EDITOR');
    if (!editorRole) {
      throw new Error('EDITOR role not found. Run migrations first!');
    }

    const admin = new AccountEntity(
      crypto.randomUUID(),
      'Admin User',
      'admin@test.com',
      'hashed123',
      new Date(),
      new Date(),
      adminRole,
    );
    await accountRepository.create(admin);

    const createAccountDto = {
      name: 'New User',
      email: 'newuser@test.com',
      password: 'Password123',
      roleId: editorRole.getId(),
    };

    const result = await useCase.execute(admin, createAccountDto);

    expect(result).toHaveProperty('token');
    expect(result.token).toBe('mock-token');

    const createdUser = await accountRepository.findByEmail('newuser@test.com');
    expect(createdUser).not.toBeNull();
    expect(createdUser?.getName()).toBe('New User');
    expect(createdUser?.getEmail()).toBe('newuser@test.com');
    expect(createdUser?.getRole()?.getId()).toBe(editorRole.getId());
  });

  it('should throw ForbiddenError when user does not have permission', async () => {
    const readerRole = await roleRepository.findByName('READER');
    if (!readerRole) {
      throw new Error('READER role not found. Run migrations first!');
    }

    const reader = new AccountEntity(
      crypto.randomUUID(),
      'Reader User',
      'reader@test.com',
      'hashed456',
      new Date(),
      new Date(),
      readerRole,
    );
    await accountRepository.create(reader);

    const createAccountDto = {
      name: 'Another User',
      email: 'another@test.com',
      password: 'Password456',
      roleId: readerRole.getId(),
    };

    await expect(useCase.execute(reader, createAccountDto)).rejects.toThrow(
      new ForbiddenError('You are not allowed to create an account'),
    );
  });
});
