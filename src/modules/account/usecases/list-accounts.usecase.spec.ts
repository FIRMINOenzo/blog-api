import { Test, TestingModule } from '@nestjs/testing';
import { ListAccountsUseCase } from './list-accounts.usecase';
import { AccountRepository } from 'src/domain/repositories/account.repository';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from 'src/domain/value-objects';

describe('ListAccountsUseCase', () => {
  let useCase: ListAccountsUseCase;
  let accountRepository: jest.Mocked<AccountRepository>;

  const ADMIN_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'ADMIN',
    [new Permission(PermissionAction.READ, PermissionSubject.ACCOUNT)],
  );

  const EDITOR_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440001',
    'EDITOR',
    [new Permission(PermissionAction.READ, PermissionSubject.ARTICLE)],
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

  const ACCOUNT_1 = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440003',
    'John Doe',
    'john.doe@example.com',
    'hashed-password',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    EDITOR_ROLE,
  );

  const ACCOUNT_2 = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440004',
    'Jane Smith',
    'jane.smith@example.com',
    'hashed-password',
    new Date('2024-01-10'),
    new Date('2024-01-18'),
    EDITOR_ROLE,
  );

  beforeEach(async () => {
    const mockAccountRepository: Partial<AccountRepository> = {
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAccountsUseCase,
        {
          provide: 'AccountRepository',
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListAccountsUseCase>(ListAccountsUseCase);
    accountRepository = module.get('AccountRepository');
  });

  describe('execute', () => {
    it('should return paginated list of accounts with default pagination', async () => {
      const accounts = [ACCOUNT_1, ACCOUNT_2];
      accountRepository.findAllPaginated.mockResolvedValue({
        accounts,
        total: 2,
      });

      const result = await useCase.execute(ADMIN_ACCOUNT);

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      expect(accountRepository.findAllPaginated).toHaveBeenCalledWith(0, 10);
    });

    it('should return paginated list with custom page and limit', async () => {
      accountRepository.findAllPaginated.mockResolvedValue({
        accounts: [ACCOUNT_1],
        total: 5,
      });

      const result = await useCase.execute(ADMIN_ACCOUNT, {
        page: 2,
        limit: 1,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 2,
        limit: 1,
        total: 5,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      });
      expect(accountRepository.findAllPaginated).toHaveBeenCalledWith(1, 1);
    });

    it('should return list of accounts with correct format', async () => {
      const accounts = [ACCOUNT_1, ACCOUNT_2];
      accountRepository.findAllPaginated.mockResolvedValue({
        accounts,
        total: 2,
      });

      const result = await useCase.execute(ADMIN_ACCOUNT);

      expect(result.data).toEqual([
        {
          id: ACCOUNT_1.getId(),
          name: ACCOUNT_1.getName(),
          email: ACCOUNT_1.getEmail(),
          role: {
            id: EDITOR_ROLE.getId(),
            name: EDITOR_ROLE.getName(),
          },
          createdAt: ACCOUNT_1.getCreatedAt(),
          updatedAt: ACCOUNT_1.getUpdatedAt(),
        },
        {
          id: ACCOUNT_2.getId(),
          name: ACCOUNT_2.getName(),
          email: ACCOUNT_2.getEmail(),
          role: {
            id: EDITOR_ROLE.getId(),
            name: EDITOR_ROLE.getName(),
          },
          createdAt: ACCOUNT_2.getCreatedAt(),
          updatedAt: ACCOUNT_2.getUpdatedAt(),
        },
      ]);
    });

    it('should return empty list when no accounts exist', async () => {
      accountRepository.findAllPaginated.mockResolvedValue({
        accounts: [],
        total: 0,
      });

      const result = await useCase.execute(ADMIN_ACCOUNT);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should throw ForbiddenError when user lacks READ:ACCOUNT permission', async () => {
      const editorAccount = new AccountEntity(
        '550e8400-e29b-41d4-a716-446655440005',
        'Editor User',
        'editor@example.com',
        'hashed-password',
        new Date(),
        new Date(),
        EDITOR_ROLE,
      );

      await expect(useCase.execute(editorAccount)).rejects.toThrow(
        ForbiddenError,
      );

      await expect(useCase.execute(editorAccount)).rejects.toThrow(
        'You are not allowed to list accounts',
      );

      expect(accountRepository.findAllPaginated).not.toHaveBeenCalled();
    });

    it('should handle single account in list', async () => {
      accountRepository.findAllPaginated.mockResolvedValue({
        accounts: [ACCOUNT_1],
        total: 1,
      });

      const result = await useCase.execute(ADMIN_ACCOUNT);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(ACCOUNT_1.getId());
    });

    it('should map all account properties correctly', async () => {
      accountRepository.findAllPaginated.mockResolvedValue({
        accounts: [ACCOUNT_1],
        total: 1,
      });

      const result = await useCase.execute(ADMIN_ACCOUNT);

      const account = result.data[0];
      expect(account).toHaveProperty('id');
      expect(account).toHaveProperty('name');
      expect(account).toHaveProperty('email');
      expect(account).toHaveProperty('role');
      expect(account).toHaveProperty('createdAt');
      expect(account).toHaveProperty('updatedAt');
      expect(account.role).toHaveProperty('id');
      expect(account.role).toHaveProperty('name');
    });
  });
});
