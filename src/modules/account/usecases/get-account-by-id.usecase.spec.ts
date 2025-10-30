import { Test, TestingModule } from '@nestjs/testing';
import { GetAccountByIdUseCase } from './get-account-by-id.usecase';
import { AccountRepository } from 'src/domain/repositories/account.repository';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import { NotFoundError } from 'src/domain/errors/not-found.error';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
  UUID,
} from 'src/domain/value-objects';

describe('GetAccountByIdUseCase', () => {
  let useCase: GetAccountByIdUseCase;
  let accountRepository: jest.Mocked<AccountRepository>;

  const ADMIN_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'ADMIN',
    [new Permission(PermissionAction.READ, PermissionSubject.ACCOUNT)],
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

  const TARGET_ACCOUNT = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440003',
    'John Doe',
    'john.doe@example.com',
    'hashed-password',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    EDITOR_ROLE,
  );

  beforeEach(async () => {
    const mockAccountRepository: Partial<AccountRepository> = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAccountByIdUseCase,
        {
          provide: 'AccountRepository',
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAccountByIdUseCase>(GetAccountByIdUseCase);
    accountRepository = module.get('AccountRepository');
  });

  describe('execute', () => {
    it('should return account details when account exists', async () => {
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);

      const result = await useCase.execute(
        ADMIN_ACCOUNT,
        TARGET_ACCOUNT.getId(),
      );

      expect(result).toEqual({
        id: TARGET_ACCOUNT.getId(),
        name: TARGET_ACCOUNT.getName(),
        email: TARGET_ACCOUNT.getEmail(),
        role: {
          id: EDITOR_ROLE.getId(),
          name: EDITOR_ROLE.getName(),
        },
        createdAt: TARGET_ACCOUNT.getCreatedAt(),
        updatedAt: TARGET_ACCOUNT.getUpdatedAt(),
      });
      expect(accountRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should call repository with correct UUID', async () => {
      const accountId = '550e8400-e29b-41d4-a716-446655440003';
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);

      await useCase.execute(ADMIN_ACCOUNT, accountId);

      expect(accountRepository.findById).toHaveBeenCalledWith(
        new UUID(accountId),
      );
    });

    it('should throw NotFoundError when account does not exist', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';
      accountRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(ADMIN_ACCOUNT, nonExistentId),
      ).rejects.toThrow(NotFoundError);

      await expect(
        useCase.execute(ADMIN_ACCOUNT, nonExistentId),
      ).rejects.toThrow(`Account with id '${nonExistentId}' not found`);
    });

    it('should throw ForbiddenError when user lacks READ:ACCOUNT permission', async () => {
      const editorAccount = new AccountEntity(
        '550e8400-e29b-41d4-a716-446655440004',
        'Editor User',
        'editor@example.com',
        'hashed-password',
        new Date(),
        new Date(),
        EDITOR_ROLE,
      );

      await expect(
        useCase.execute(editorAccount, TARGET_ACCOUNT.getId()),
      ).rejects.toThrow(ForbiddenError);

      await expect(
        useCase.execute(editorAccount, TARGET_ACCOUNT.getId()),
      ).rejects.toThrow('You are not allowed to read accounts');

      expect(accountRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error when invalid UUID format is provided', async () => {
      const invalidId = 'invalid-uuid';

      await expect(useCase.execute(ADMIN_ACCOUNT, invalidId)).rejects.toThrow();
    });
  });
});
