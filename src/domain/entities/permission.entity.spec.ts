import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import {
  PermissionAction,
  PermissionEntity,
  PermissionSubject,
} from './permission.entity';

describe('Permission Entity', () => {
  describe('Create', () => {
    test('should create a valid permission', () => {
      const permission = new PermissionEntity(
        crypto.randomUUID(),
        PermissionAction.CREATE,
        PermissionSubject.ACCOUNT,
      );
      expect(permission.getId()).toBeDefined();
      expect(permission.getAction()).toBe('CREATE');
      expect(permission.getSubject()).toBe('ACCOUNT');
    });

    test('should throw an error when creating a permission with an invalid action', () => {
      expect(
        () =>
          new PermissionEntity(
            crypto.randomUUID(),
            'INVALID' as PermissionAction,
            PermissionSubject.ACCOUNT,
          ),
      ).toThrow(new ValueObjectValidationError('Invalid permission action'));
    });

    test('should throw an error when creating a permission with an invalid subject', () => {
      expect(
        () =>
          new PermissionEntity(
            crypto.randomUUID(),
            PermissionAction.CREATE,
            'INVALID' as PermissionSubject,
          ),
      ).toThrow(new ValueObjectValidationError('Invalid permission subject'));
    });
  });
});
