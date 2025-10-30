import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAccountUseCase } from './update-account.usecase';
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
} from 'src/domain/value-objects';

describe('UpdateAccountUseCase', () => {
  let useCase: UpdateAccountUseCase;
  let accountRepository: jest.Mocked<AccountRepository>;
  let roleRepository: jest.Mocked<RoleRepository>;
  let hashPasswordService: jest.Mocked<HashPasswordService>;

  const ADMIN_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'ADMIN',
    [new Permission(PermissionAction.UPDATE, PermissionSubject.ACCOUNT)],
  );

  const EDITOR_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440001',
    'EDITOR',
    [],
  );

  const READER_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440005',
    'READER',
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
      findByEmail: jest.fn(),
      update: jest.fn(),
    };

    const mockRoleRepository: Partial<RoleRepository> = {
      findById: jest.fn(),
    };

    const mockHashPasswordService: Partial<HashPasswordService> = {
      hash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAccountUseCase,
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
      ],
    }).compile();

    useCase = module.get<UpdateAccountUseCase>(UpdateAccountUseCase);
    accountRepository = module.get('AccountRepository');
    roleRepository = module.get('RoleRepository');
    hashPasswordService = module.get(HashPasswordService);
  });

  describe('execute', () => {
    it('should update account name successfully', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      const input = { name: 'John Updated' };
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);
      accountRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute(ADMIN_ACCOUNT, accountId, input);

      expect(result.name).toBe('John Updated');
      expect(result.email).toBe(TARGET_ACCOUNT.getEmail());
      expect(accountRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should update account email successfully', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      const input = { email: 'newemail@example.com' };
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);
      accountRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute(ADMIN_ACCOUNT, accountId, input);

      expect(result.email).toBe('newemail@example.com');
      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        'newemail@example.com',
      );
    });

    it('should update account password successfully', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      const input = { password: 'NewSecurePass123' };
      const hashedNewPassword = 'new-hashed-password';
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);
      hashPasswordService.hash.mockResolvedValue(hashedNewPassword);

      await useCase.execute(ADMIN_ACCOUNT, accountId, input);

      expect(hashPasswordService.hash).toHaveBeenCalledWith('NewSecurePass123');
      const updatedAccount = accountRepository.update.mock.calls[0][0];
      expect(updatedAccount.getPassword()).toBe(hashedNewPassword);
    });

    it('should update account role successfully', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      const input = { roleId: READER_ROLE.getId() };
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);
      roleRepository.findById.mockResolvedValue(READER_ROLE);

      const result = await useCase.execute(ADMIN_ACCOUNT, accountId, input);

      expect(result.role.id).toBe(READER_ROLE.getId());
      expect(result.role.name).toBe(READER_ROLE.getName());
    });

    it('should update multiple fields at once', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      const input = {
        name: 'Updated Name',
        email: 'updated@example.com',
        password: 'NewPass123',
        roleId: READER_ROLE.getId(),
      };
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);
      accountRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findById.mockResolvedValue(READER_ROLE);
      hashPasswordService.hash.mockResolvedValue('new-hashed');

      const result = await useCase.execute(ADMIN_ACCOUNT, accountId, input);

      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('updated@example.com');
      expect(result.role.id).toBe(READER_ROLE.getId());
      expect(hashPasswordService.hash).toHaveBeenCalled();
    });

    it('should throw NotFoundError when account does not exist', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';
      const input = { name: 'Updated' };
      accountRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(ADMIN_ACCOUNT, nonExistentId, input),
      ).rejects.toThrow(NotFoundError);

      await expect(
        useCase.execute(ADMIN_ACCOUNT, nonExistentId, input),
      ).rejects.toThrow(`Account with id '${nonExistentId}' not found`);

      expect(accountRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when new role does not exist', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      const input = { roleId: '550e8400-e29b-41d4-a716-446655440099' };
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);
      roleRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(ADMIN_ACCOUNT, accountId, input),
      ).rejects.toThrow(NotFoundError);

      await expect(
        useCase.execute(ADMIN_ACCOUNT, accountId, input),
      ).rejects.toThrow('Role not found');

      expect(accountRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new email is already in use', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      const input = { email: 'existing@example.com' };
      const existingAccount = new AccountEntity(
        '550e8400-e29b-41d4-a716-446655440099',
        'Other User',
        'existing@example.com',
        'hashed',
        new Date(),
        new Date(),
        EDITOR_ROLE,
      );
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);
      accountRepository.findByEmail.mockResolvedValue(existingAccount);

      await expect(
        useCase.execute(ADMIN_ACCOUNT, accountId, input),
      ).rejects.toThrow(ConflictError);

      await expect(
        useCase.execute(ADMIN_ACCOUNT, accountId, input),
      ).rejects.toThrow(`Account with email '${input.email}' already exists`);

      expect(accountRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same email', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      const input = { email: TARGET_ACCOUNT.getEmail() };
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);
      accountRepository.findByEmail.mockResolvedValue(TARGET_ACCOUNT);

      const result = await useCase.execute(ADMIN_ACCOUNT, accountId, input);

      expect(result.email).toBe(TARGET_ACCOUNT.getEmail());
      expect(accountRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenError when user lacks UPDATE:ACCOUNT permission', async () => {
      const editorAccount = new AccountEntity(
        '550e8400-e29b-41d4-a716-446655440004',
        'Editor User',
        'editor@example.com',
        'hashed-password',
        new Date(),
        new Date(),
        EDITOR_ROLE,
      );
      const input = { name: 'Updated' };

      await expect(
        useCase.execute(editorAccount, TARGET_ACCOUNT.getId(), input),
      ).rejects.toThrow(ForbiddenError);

      await expect(
        useCase.execute(editorAccount, TARGET_ACCOUNT.getId(), input),
      ).rejects.toThrow('You are not allowed to update accounts');

      expect(accountRepository.findById).not.toHaveBeenCalled();
      expect(accountRepository.update).not.toHaveBeenCalled();
    });

    it('should update updatedAt timestamp', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      const input = { name: 'Updated' };
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);

      const result = await useCase.execute(ADMIN_ACCOUNT, accountId, input);

      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        TARGET_ACCOUNT.getUpdatedAt().getTime(),
      );
    });

    it('should preserve unchanged fields when updating only name', async () => {
      const accountId = TARGET_ACCOUNT.getId();
      const input = { name: 'New Name' };
      accountRepository.findById.mockResolvedValue(TARGET_ACCOUNT);

      const result = await useCase.execute(ADMIN_ACCOUNT, accountId, input);

      expect(result.name).toBe('New Name');
      expect(result.email).toBe(TARGET_ACCOUNT.getEmail());
      expect(result.role.id).toBe(TARGET_ACCOUNT.getRole()!.getId());
    });

    it('should throw error when invalid UUID format is provided', async () => {
      const invalidId = 'invalid-uuid';
      const input = { name: 'Updated' };

      await expect(
        useCase.execute(ADMIN_ACCOUNT, invalidId, input),
      ).rejects.toThrow();
    });
  });
});
