import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CreateAccountUseCase } from './create-account.usecase';
import { AccountRepository } from 'src/domain/repositories/account.repository';
import { RoleRepository } from 'src/domain/repositories/role.repository';
import { HashPasswordService } from 'src/infra/services/hash-password.service';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import { NotFoundError } from 'src/domain/errors/not-found.error';
import { ConflictError } from 'src/domain/errors/conflict.error';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
  UUID,
} from 'src/domain/value-objects';

describe('CreateAccountUseCase', () => {
  let useCase: CreateAccountUseCase;
  let accountRepository: jest.Mocked<AccountRepository>;
  let roleRepository: jest.Mocked<RoleRepository>;
  let hashPasswordService: jest.Mocked<HashPasswordService>;
  let jwtService: jest.Mocked<JwtService>;

  const VALID_INPUT = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123',
    roleId: '550e8400-e29b-41d4-a716-446655440001',
  };

  const ADMIN_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'ADMIN',
    [new Permission(PermissionAction.CREATE, PermissionSubject.ACCOUNT)],
  );

  const EDITOR_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440001',
    'EDITOR',
    [],
  );

  const ADMIN_ACCOUNT = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440002',
    'Admin User',
    'admin@example.com',
    'hashed-admin-password',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    ADMIN_ROLE,
  );

  beforeEach(async () => {
    const mockAccountRepository: Partial<AccountRepository> = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockRoleRepository: Partial<RoleRepository> = {
      findById: jest.fn(),
    };

    const mockHashPasswordService: Partial<HashPasswordService> = {
      hash: jest.fn(),
    };

    const mockJwtService: Partial<JwtService> = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAccountUseCase,
        {
          provide: 'AccountRepository',
          useValue: mockAccountRepository,
        },
        {
          provide: 'RoleRepository',
          useValue: mockRoleRepository,
        },
        {
          provide: HashPasswordService,
          useValue: mockHashPasswordService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    useCase = module.get<CreateAccountUseCase>(CreateAccountUseCase);
    accountRepository = module.get('AccountRepository');
    roleRepository = module.get('RoleRepository');
    hashPasswordService = module.get(HashPasswordService);
    jwtService = module.get(JwtService);
  });

  describe('execute', () => {
    it('should create account and return JWT token', async () => {
      accountRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findById.mockResolvedValue(EDITOR_ROLE);
      hashPasswordService.hash.mockResolvedValue('hashed-password');
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      const result = await useCase.execute(ADMIN_ACCOUNT, VALID_INPUT);

      expect(result).toEqual({ token: 'jwt-token-123' });
      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        VALID_INPUT.email,
      );
      expect(roleRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining(new UUID(VALID_INPUT.roleId)),
      );
      expect(hashPasswordService.hash).toHaveBeenCalledWith(
        VALID_INPUT.password,
      );
      expect(accountRepository.create).toHaveBeenCalled();
    });

    it('should hash the password before creating account', async () => {
      const hashedPassword = 'super-secure-hashed-password';
      accountRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findById.mockResolvedValue(EDITOR_ROLE);
      hashPasswordService.hash.mockResolvedValue(hashedPassword);
      jwtService.signAsync.mockResolvedValue('token');

      await useCase.execute(ADMIN_ACCOUNT, VALID_INPUT);

      const createdAccount = accountRepository.create.mock.calls[0][0];
      expect(hashPasswordService.hash).toHaveBeenCalledWith(
        VALID_INPUT.password,
      );
      expect(createdAccount.getPassword()).toBe(hashedPassword);
    });

    it('should generate JWT with correct payload', async () => {
      accountRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findById.mockResolvedValue(EDITOR_ROLE);
      hashPasswordService.hash.mockResolvedValue('hashed');
      jwtService.signAsync.mockResolvedValue('token');

      await useCase.execute(ADMIN_ACCOUNT, VALID_INPUT);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: expect.any(String) as string,
          email: VALID_INPUT.email,
          name: VALID_INPUT.name,
          role: {
            id: VALID_INPUT.roleId,
            name: EDITOR_ROLE.getName(),
          },
        }),
      );
    });

    it('should throw ConflictError when email already exists', async () => {
      const existingAccount = new AccountEntity(
        '550e8400-e29b-41d4-a716-446655440003',
        'Existing User',
        VALID_INPUT.email,
        'hashed',
        new Date(),
        new Date(),
        EDITOR_ROLE,
      );
      accountRepository.findByEmail.mockResolvedValue(existingAccount);

      await expect(useCase.execute(ADMIN_ACCOUNT, VALID_INPUT)).rejects.toThrow(
        new ConflictError(
          `Account with email '${VALID_INPUT.email}' already exists`,
        ),
      );

      expect(roleRepository.findById).not.toHaveBeenCalled();
      expect(hashPasswordService.hash).not.toHaveBeenCalled();
      expect(accountRepository.create).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when role does not exist', async () => {
      accountRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(ADMIN_ACCOUNT, VALID_INPUT)).rejects.toThrow(
        NotFoundError,
      );

      await expect(useCase.execute(ADMIN_ACCOUNT, VALID_INPUT)).rejects.toThrow(
        new NotFoundError('Role not found'),
      );

      expect(hashPasswordService.hash).not.toHaveBeenCalled();
      expect(accountRepository.create).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user lacks CREATE:ACCOUNT permission', async () => {
      const editorAccount = new AccountEntity(
        '550e8400-e29b-41d4-a716-446655440004',
        'Editor User',
        'editor@example.com',
        'hashed',
        new Date(),
        new Date(),
        EDITOR_ROLE,
      );
      accountRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findById.mockResolvedValue(EDITOR_ROLE);
      hashPasswordService.hash.mockResolvedValue('hashed');

      await expect(useCase.execute(editorAccount, VALID_INPUT)).rejects.toThrow(
        new ForbiddenError('You are not allowed to create an account'),
      );

      expect(accountRepository.create).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
