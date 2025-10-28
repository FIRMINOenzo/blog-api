import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from './permission.vo';

describe('Permission Value Object', () => {
  describe('Constructor', () => {
    test('should create a valid permission', () => {
      const permission = new Permission(
        PermissionAction.CREATE,
        PermissionSubject.ACCOUNT,
      );

      expect(permission.getAction()).toBe(PermissionAction.CREATE);
      expect(permission.getSubject()).toBe(PermissionSubject.ACCOUNT);
    });

    test('should throw an error when creating a permission with an invalid action', () => {
      expect(
        () =>
          new Permission(
            'INVALID' as PermissionAction,
            PermissionSubject.ACCOUNT,
          ),
      ).toThrow(ValueObjectValidationError);
    });

    test('should throw an error when creating a permission with an invalid subject', () => {
      expect(
        () =>
          new Permission(
            PermissionAction.CREATE,
            'INVALID' as PermissionSubject,
          ),
      ).toThrow(ValueObjectValidationError);
    });

    describe('equals', () => {
      test('should return true when permissions have same action and subject', () => {
        const permission1 = new Permission(
          PermissionAction.CREATE,
          PermissionSubject.ACCOUNT,
        );
        const permission2 = new Permission(
          PermissionAction.CREATE,
          PermissionSubject.ACCOUNT,
        );

        expect(permission1.equals(permission2)).toBe(true);
        expect(permission2.equals(permission1)).toBe(true);
      });

      test('should return false when permissions have different actions', () => {
        const permission1 = new Permission(
          PermissionAction.CREATE,
          PermissionSubject.ACCOUNT,
        );
        const permission2 = new Permission(
          PermissionAction.UPDATE,
          PermissionSubject.ACCOUNT,
        );

        expect(permission1.equals(permission2)).toBe(false);
      });

      test('should return false when permissions have different subjects', () => {
        const permission1 = new Permission(
          PermissionAction.CREATE,
          PermissionSubject.ACCOUNT,
        );
        const permission2 = new Permission(
          PermissionAction.CREATE,
          PermissionSubject.ARTICLE,
        );

        expect(permission1.equals(permission2)).toBe(false);
      });
    });

    describe('toString', () => {
      test('should return correct string representation', () => {
        const permission = new Permission(
          PermissionAction.CREATE,
          PermissionSubject.ACCOUNT,
        );

        expect(permission.toString()).toBe('CREATE:ACCOUNT');
      });
    });

    describe('Factory Method', () => {
      test('create should create a permission', () => {
        const permission = Permission.create(
          PermissionAction.READ,
          PermissionSubject.ARTICLE,
        );

        expect(permission.getAction()).toBe(PermissionAction.READ);
        expect(permission.getSubject()).toBe(PermissionSubject.ARTICLE);
      });
    });
  });
});
