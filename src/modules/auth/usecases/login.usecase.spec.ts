import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './login.usecase';
import { AccountRepository } from 'src/domain/repositories/account.repository';
import { HashPasswordService } from 'src/infra/services/hash-password.service';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from 'src/domain/value-objects';
import { UnauthorizedError } from 'src/domain/errors/unauthorized.error';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let accountRepository: jest.Mocked<AccountRepository>;
  let hashPasswordService: jest.Mocked<HashPasswordService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockRole = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'ADMIN',
    [new Permission(PermissionAction.CREATE, PermissionSubject.ACCOUNT)],
  );

  const mockAccount = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440001',
    'Test User',
    'test@example.com',
    '$2b$10$hashedpassword',
    new Date(),
    new Date(),
    mockRole,
  );

  beforeEach(async () => {
    const mockAccountRepository: Partial<AccountRepository> = {
      findByEmail: jest.fn(),
    };

    const mockHashPasswordService: Partial<HashPasswordService> = {
      compare: jest.fn(),
    };

    const mockJwtService: Partial<JwtService> = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: 'AccountRepository',
          useValue: mockAccountRepository,
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

    useCase = module.get<LoginUseCase>(LoginUseCase);
    accountRepository = module.get('AccountRepository');
    hashPasswordService = module.get(HashPasswordService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access token and user data on successful login', async () => {
      accountRepository.findByEmail.mockResolvedValue(mockAccount);
      hashPasswordService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await useCase.execute(loginInput);

      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        loginInput.email,
      );
      expect(hashPasswordService.compare).toHaveBeenCalledWith(
        loginInput.password,
        mockAccount.getPassword(),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: '550e8400-e29b-41d4-a716-446655440001',
        email: 'test@example.com',
        name: 'Test User',
        role: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'ADMIN',
        },
      });
      expect(result).toEqual({
        token: 'mock-jwt-token',
      });
    });

    it('should throw UnauthorizedError when user not found', async () => {
      accountRepository.findByEmail.mockResolvedValue(null);
      await expect(useCase.execute(loginInput)).rejects.toThrow(
        new UnauthorizedError('Invalid credentials'),
      );
      expect(hashPasswordService.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when password is invalid', async () => {
      accountRepository.findByEmail.mockResolvedValue(mockAccount);
      hashPasswordService.compare.mockResolvedValue(false);
      await expect(useCase.execute(loginInput)).rejects.toThrow(
        new UnauthorizedError('Invalid credentials'),
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should not expose password in error messages', async () => {
      accountRepository.findByEmail.mockResolvedValue(mockAccount);
      hashPasswordService.compare.mockResolvedValue(false);
      await expect(useCase.execute(loginInput)).rejects.toThrow(
        new UnauthorizedError('Invalid credentials'),
      );
    });
  });
});
