import {
  Name,
  UUID,
  Permission,
  PermissionAction,
  PermissionSubject,
} from '../value-objects';

export class RoleEntity {
  private readonly id: UUID;
  private readonly name: Name;
  private readonly permissions: Permission[];

  constructor(id: string, name: string, permissions?: Permission[]) {
    this.id = new UUID(id);
    this.name = new Name(name);
    this.permissions = permissions ?? [];
  }

  hasPermission(action: PermissionAction, subject: PermissionSubject): boolean {
    return this.permissions.some(
      (permission) =>
        permission.getAction() === action &&
        permission.getSubject() === subject,
    );
  }

  getId(): string {
    return this.id.getValue();
  }

  getName(): string {
    return this.name.getValue();
  }

  getPermissions(): Permission[] {
    return [...this.permissions];
  }
}

export enum RoleName {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  READER = 'READER',
}
