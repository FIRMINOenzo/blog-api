import { Test, TestingModule } from '@nestjs/testing';
import { DeleteAccountUseCase } from './delete-account.usecase';
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

describe('DeleteAccountUseCase', () => {
  let useCase: DeleteAccountUseCase;
  let accountRepository: jest.Mocked<AccountRepository>;

  const ADMIN_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'ADMIN',
    [new Permission(PermissionAction.DELETE, PermissionSubject.ACCOUNT)],
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
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAccountUseCase,
        {
          provide: 'AccountRepository',
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteAccountUseCase>(DeleteAccountUseCase);
    accountRepository = module.get('AccountRepository');
  });

  describe('execute', () => {
    it('should delete account successfully', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);

      await useCase.execute(ADMIN_ACCOUNT, accountId);

      expect(accountRepository.findById).toHaveBeenCalledTimes(1);
      expect(accountRepository.delete).toHaveBeenCalledWith(TARGET_ACCOUNT);
      expect(accountRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should call repository with correct UUID', async () => {
      const accountId = TARGET_ACCOUNT.getId();
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

      expect(accountRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user lacks DELETE:ACCOUNT permission', async () => {
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
      ).rejects.toThrow('You are not allowed to delete accounts');

      expect(accountRepository.findById).not.toHaveBeenCalled();
      expect(accountRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when trying to delete own account', async () => {
      const adminId = ADMIN_ACCOUNT.getId();
      accountRepository.findById.mockResolvedValue(ADMIN_ACCOUNT);

      await expect(useCase.execute(ADMIN_ACCOUNT, adminId)).rejects.toThrow(
        ForbiddenError,
      );

      await expect(useCase.execute(ADMIN_ACCOUNT, adminId)).rejects.toThrow(
        'You cannot delete your own account',
      );

      expect(accountRepository.delete).not.toHaveBeenCalled();
    });

    it('should prevent self-deletion even with valid permissions', async () => {
      const adminId = ADMIN_ACCOUNT.getId();
      accountRepository.findById.mockResolvedValue(ADMIN_ACCOUNT);

      await expect(useCase.execute(ADMIN_ACCOUNT, adminId)).rejects.toThrow(
        'You cannot delete your own account',
      );

      expect(accountRepository.findById).toHaveBeenCalledTimes(1);
      expect(accountRepository.delete).not.toHaveBeenCalled();
    });

    it('should allow admin to delete other accounts', async () => {
      const anotherAdmin = new AccountEntity(
        '550e8400-e29b-41d4-a716-446655440010',
        'Another Admin',
        'another.admin@example.com',
        'hashed-password',
        new Date(),
        new Date(),
        ADMIN_ROLE,
      );
      accountRepository.findById.mockResolvedValue(anotherAdmin);

      await useCase.execute(ADMIN_ACCOUNT, anotherAdmin.getId());

      expect(accountRepository.delete).toHaveBeenCalledWith(anotherAdmin);
    });

    it('should throw error when invalid UUID format is provided', async () => {
      const invalidId = 'invalid-uuid';

      await expect(useCase.execute(ADMIN_ACCOUNT, invalidId)).rejects.toThrow();

      expect(accountRepository.delete).not.toHaveBeenCalled();
    });

    it('should pass the account entity to repository delete method', async () => {
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);

      await useCase.execute(ADMIN_ACCOUNT, TARGET_ACCOUNT.getId());

      const deletedAccount = accountRepository.delete.mock.calls[0][0];
      expect(deletedAccount).toBeInstanceOf(AccountEntity);
      expect(deletedAccount.getId()).toBe(TARGET_ACCOUNT.getId());
      expect(deletedAccount.getName()).toBe(TARGET_ACCOUNT.getName());
      expect(deletedAccount.getEmail()).toBe(TARGET_ACCOUNT.getEmail());
    });
  });
});
