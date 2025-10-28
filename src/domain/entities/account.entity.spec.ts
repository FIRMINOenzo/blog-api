import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { AccountEntity } from './account.entity';

describe('Account Entity', () => {
  describe('Create', () => {
    test('should create a valid account', () => {
      const account = AccountEntity.create(
        'John Doe',
        'john.doe@example.com',
        'Password123',
      );
      expect(account.getId()).toBeDefined();
      expect(account.getName()).toBe('John Doe');
      expect(account.getEmail()).toBe('john.doe@example.com');
      expect(account.getPassword()).toBe('Password123');
    });

    test('should throw an error when creating an account with an invalid information', () => {
      expect(() =>
        AccountEntity.create('', 'john.doe@example.com', 'Password123'),
      ).toThrow(
        new ValueObjectValidationError(
          'Name must be at least 1 character long',
        ),
      );
    });
  });

  describe('Update Information', () => {
    test('should update the account information', () => {
      const account = AccountEntity.create(
        'John Doe',
        'john.doe@example.com',
        'Password123',
      );
      account.updateInformation(
        'John Doe 2°',
        'john.doe2@example.com',
        'Password234@',
      );
      expect(account.getName()).toBe('John Doe 2°');
      expect(account.getEmail()).toBe('john.doe2@example.com');
      expect(account.getPassword()).toBe('Password234@');
    });

    test('should throw an error when updating the account information with an invalid information', () => {
      const account = AccountEntity.create(
        'John Doe',
        'john.doe@example.com',
        'Password123',
      );
      expect(() =>
        account.updateInformation('John Doe 2°', 'john.doe2', 'Password234@'),
      ).toThrow(new ValueObjectValidationError('Invalid email address'));
    });
  });
});
