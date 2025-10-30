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
    it('should return list of accounts with correct format', async () => {
      const accounts = [ACCOUNT_1, ACCOUNT_2];
      accountRepository.findAll.mockResolvedValue(accounts);

      const result = await useCase.execute(ADMIN_ACCOUNT);

      expect(result).toEqual({
        accounts: [
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
        ],
        total: 2,
      });
      expect(accountRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty list when no accounts exist', async () => {
      accountRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute(ADMIN_ACCOUNT);

      expect(result).toEqual({
        accounts: [],
        total: 0,
      });
      expect(accountRepository.findAll).toHaveBeenCalledTimes(1);
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

      expect(accountRepository.findAll).not.toHaveBeenCalled();
    });

    it('should handle single account in list', async () => {
      accountRepository.findAll.mockResolvedValue([ACCOUNT_1]);

      const result = await useCase.execute(ADMIN_ACCOUNT);

      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0].id).toBe(ACCOUNT_1.getId());
    });

    it('should map all account properties correctly', async () => {
      accountRepository.findAll.mockResolvedValue([ACCOUNT_1]);

      const result = await useCase.execute(ADMIN_ACCOUNT);

      const account = result.accounts[0];
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
