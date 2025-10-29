import { ForbiddenError } from '../errors/forbidden.error';
import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from '../value-objects';
import { AccountEntity } from './account.entity';
import { RoleEntity, RoleName } from './role.entity';

describe('Account Entity', () => {
  const createAccountPermission = new Permission(
    PermissionAction.CREATE,
    PermissionSubject.ACCOUNT,
  );
  const updateAccountPermission = new Permission(
    PermissionAction.UPDATE,
    PermissionSubject.ACCOUNT,
  );
  const accountRole = new RoleEntity(crypto.randomUUID(), RoleName.ADMIN, [
    updateAccountPermission,
    createAccountPermission,
  ]);
  const accountWithPermission = new AccountEntity(
    crypto.randomUUID(),
    'John Doe',
    'john.doe@example.com',
    'Password123',
    new Date(),
    new Date(),
    accountRole,
  );
  const accountWithoutPermission = new AccountEntity(
    crypto.randomUUID(),
    'John Doe',
    'john.doe@example.com',
    'Password123',
    new Date(),
    new Date(),
    new RoleEntity(crypto.randomUUID(), RoleName.READER),
  );

  describe('Create', () => {
    test('should create a valid account', () => {
      const account = AccountEntity.create(
        accountWithPermission,
        'John Doe',
        'john.doe@example.com',
        'Password123',
        new RoleEntity(crypto.randomUUID(), RoleName.ADMIN),
      );
      expect(account.getId()).toBeDefined();
      expect(account.getName()).toBe('John Doe');
      expect(account.getEmail()).toBe('john.doe@example.com');
      expect(account.getPassword()).toBe('Password123');
    });

    test('should throw an error when creating an account with an invalid information', () => {
      expect(() =>
        AccountEntity.create(
          accountWithPermission,
          '',
          'john.doe@example.com',
          'Password123',
          new RoleEntity(crypto.randomUUID(), RoleName.ADMIN),
        ),
      ).toThrow(
        new ValueObjectValidationError(
          'Name must be at least 1 character long',
        ),
      );
    });

    test('should throw an error when creating an account without permission', () => {
      expect(() =>
        AccountEntity.create(
          accountWithoutPermission,
          'John Doe',
          'john.doe@example.com',
          'Password123',
          new RoleEntity(crypto.randomUUID(), RoleName.ADMIN),
        ),
      ).toThrow(new ForbiddenError('You are not allowed to create an account'));
    });
  });

  describe('Update Information', () => {
    test('should update the account information', () => {
      const account = AccountEntity.create(
        accountWithPermission,
        'John Doe',
        'john.doe@example.com',
        'Password123',
        new RoleEntity(crypto.randomUUID(), RoleName.ADMIN),
      );
      account.updateInformation(
        accountWithPermission,
        'John Doe 2°',
        'john.doe2@example.com',
      );
      expect(account.getName()).toBe('John Doe 2°');
      expect(account.getEmail()).toBe('john.doe2@example.com');
    });

    test('should throw an error when updating the account information with an invalid information', () => {
      const account = AccountEntity.create(
        accountWithPermission,
        'John Doe',
        'john.doe@example.com',
        'Password123',
        accountRole,
      );
      expect(() =>
        account.updateInformation(
          accountWithPermission,
          'John Doe 2°',
          'john.doe2',
        ),
      ).toThrow(new ValueObjectValidationError('Invalid email address'));
    });

    test('should throw an error when updating the account information without permission', () => {
      const account = AccountEntity.create(
        accountWithPermission,
        'John Doe',
        'john.doe@example.com',
        'Password123',
        new RoleEntity(crypto.randomUUID(), RoleName.ADMIN),
      );
      expect(() =>
        account.updateInformation(
          accountWithoutPermission,
          'John Doe 2°',
          'john.doe2@example.com',
        ),
      ).toThrow(
        new ForbiddenError(
          'You are not allowed to update the account information',
        ),
      );
    });
  });

  describe('Change Password', () => {
    test('should change the account password', () => {
      const account = AccountEntity.create(
        accountWithPermission,
        'John Doe',
        'john.doe@example.com',
        'Password123',
        accountRole,
      );
      account.changePassword(account, 'Password123@');
      expect(account.getPassword()).toBe('Password123@');
    });

    test('should throw an error when changing the account password without permission', () => {
      const account = AccountEntity.create(
        accountWithPermission,
        'John Doe',
        'john.doe@example.com',
        'Password123',
        accountRole,
      );
      expect(() =>
        account.changePassword(accountWithoutPermission, 'Password123@'),
      ).toThrow(
        new ForbiddenError(
          'You are not allowed to update the account password',
        ),
      );
    });

    test('should throw an error when changing the account password with an invalid password', () => {
      const account = AccountEntity.create(
        accountWithPermission,
        'John Doe',
        'john.doe@example.com',
        'Password123',
        accountRole,
      );
      expect(() => account.changePassword(account, '')).toThrow(
        new ValueObjectValidationError('Hashed password cannot be empty'),
      );
    });
  });

  describe('Set Role', () => {
    test('should set the account role', () => {
      const account = AccountEntity.create(
        accountWithPermission,
        'John Doe',
        'john.doe@example.com',
        'Password123',
        accountRole,
      );
      account.setRole(
        accountWithPermission,
        new RoleEntity(crypto.randomUUID(), RoleName.ADMIN),
      );
      expect(account.getRole()).toBeDefined();
      expect(account.getRole()?.getName()).toBe('ADMIN');
    });

    test('should throw an error when setting the account role without permission', () => {
      const account = AccountEntity.create(
        accountWithPermission,
        'John Doe',
        'john.doe@example.com',
        'Password123',
        accountRole,
      );
      expect(() =>
        account.setRole(
          accountWithoutPermission,
          new RoleEntity(crypto.randomUUID(), RoleName.ADMIN),
        ),
      ).toThrow(
        new ForbiddenError('You are not allowed to update the account role'),
      );
    });
  });
});
