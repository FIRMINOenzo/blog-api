import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from '../value-objects/permission.vo';
import { RoleEntity, RoleName } from './role.entity';

describe('Role Entity', () => {
  describe('Create', () => {
    test('should create a valid role', () => {
      const role = new RoleEntity(crypto.randomUUID(), RoleName.ADMIN);
      expect(role.getId()).toBeDefined();
      expect(role.getName()).toBe('ADMIN');
    });

    test('should throw an error when creating a role with an invalid name', () => {
      expect(() => new RoleEntity(crypto.randomUUID(), '')).toThrow(
        new ValueObjectValidationError(
          'Name must be at least 1 character long',
        ),
      );
    });
  });

  describe('Has Permission', () => {
    test('should return true when the role has the permission', () => {
      const role = new RoleEntity(crypto.randomUUID(), RoleName.ADMIN, [
        new Permission(PermissionAction.CREATE, PermissionSubject.ACCOUNT),
      ]);
      expect(
        role.hasPermission(PermissionAction.CREATE, PermissionSubject.ACCOUNT),
      ).toBe(true);
    });

    test('should return false when the role does not have the permission', () => {
      const role = new RoleEntity(crypto.randomUUID(), RoleName.ADMIN);
      expect(
        role.hasPermission(PermissionAction.CREATE, PermissionSubject.ACCOUNT),
      ).toBe(false);
    });
  });

  describe('Get Permissions', () => {
    test('should return a copy of the role permissions and not modify the original permissions', () => {
      const role = new RoleEntity(crypto.randomUUID(), RoleName.ADMIN, [
        new Permission(PermissionAction.CREATE, PermissionSubject.ACCOUNT),
        new Permission(PermissionAction.READ, PermissionSubject.ARTICLE),
      ]);
      const permissionsCopy = role.getPermissions();
      expect(permissionsCopy).toBeDefined();
      expect(permissionsCopy.length).toBe(2);
      expect(permissionsCopy[0].getAction()).toBe(PermissionAction.CREATE);
      expect(permissionsCopy[0].getSubject()).toBe(PermissionSubject.ACCOUNT);
      expect(permissionsCopy[1].getAction()).toBe(PermissionAction.READ);
      expect(permissionsCopy[1].getSubject()).toBe(PermissionSubject.ARTICLE);

      permissionsCopy.push(
        new Permission(PermissionAction.UPDATE, PermissionSubject.ACCOUNT),
      );

      const permissions = role.getPermissions();
      expect(permissions).toBeDefined();
      expect(permissions.length).toBe(2);
      expect(permissions[0].getAction()).toBe(PermissionAction.CREATE);
      expect(permissions[0].getSubject()).toBe(PermissionSubject.ACCOUNT);
      expect(permissions[1].getAction()).toBe(PermissionAction.READ);
      expect(permissions[1].getSubject()).toBe(PermissionSubject.ARTICLE);
    });
  });
});
