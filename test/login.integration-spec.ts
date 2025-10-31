import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '../src/modules/auth/usecases/login.usecase';
import { DbAccountRepository } from '../src/infra/repositories/db-account.repository';
import { DbRoleRepository } from '../src/infra/repositories/db-role.repository';
import { HashPasswordService } from '../src/infra/services/hash-password.service';
import { DbAccountEntity } from '../src/infra/database/entities/db-account.entity';
import { DbRoleEntity } from '../src/infra/database/entities/db-role.entity';
import { AccountEntity } from '../src/domain/entities/account.entity';
import { UnauthorizedError } from '../src/domain/errors/unauthorized.error';
import { AppDataSource } from '../src/infra/database/data-source';

describe('LoginUseCase - Integration', () => {
  let useCase: LoginUseCase;
  let accountRepository: DbAccountRepository;
  let hashPasswordService: HashPasswordService;
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
        LoginUseCase,
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
            signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
          },
        },
        HashPasswordService,
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    accountRepository = module.get('AccountRepository');
    hashPasswordService = module.get<HashPasswordService>(HashPasswordService);
    roleRepository = module.get('RoleRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should login successfully with valid credentials', async () => {
    const editorRole = await roleRepository.findByName('EDITOR');
    if (!editorRole) {
      throw new Error('EDITOR role not found. Run migrations first!');
    }

    const plainPassword = 'MyPassword123';
    const hashedPassword = await hashPasswordService.hash(plainPassword);

    const user = new AccountEntity(
      crypto.randomUUID(),
      'Login User',
      'login-user@test.com',
      hashedPassword,
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(user);

    const loginDto = {
      email: 'login-user@test.com',
      password: plainPassword,
    };

    const result = await useCase.execute(loginDto);

    expect(result).toHaveProperty('token');
    expect(result.token).toBe('mock-jwt-token');
  });

  it('should throw UnauthorizedError with invalid password', async () => {
    const readerRole = await roleRepository.findByName('READER');
    if (!readerRole) {
      throw new Error('READER role not found. Run migrations first!');
    }

    const plainPassword = 'CorrectPassword123';
    const hashedPassword = await hashPasswordService.hash(plainPassword);

    const user = new AccountEntity(
      crypto.randomUUID(),
      'User Wrong Pass',
      'wrong-pass@test.com',
      hashedPassword,
      new Date(),
      new Date(),
      readerRole,
    );
    await accountRepository.create(user);

    const loginDto = {
      email: 'wrong-pass@test.com',
      password: 'WrongPassword123',
    };

    await expect(useCase.execute(loginDto)).rejects.toThrow(
      new UnauthorizedError('Invalid credentials'),
    );
  });

  it('should throw UnauthorizedError with non-existent email', async () => {
    const loginDto = {
      email: 'nonexistent@test.com',
      password: 'SomePassword123',
    };

    await expect(useCase.execute(loginDto)).rejects.toThrow(
      new UnauthorizedError('Invalid credentials'),
    );
  });
});
