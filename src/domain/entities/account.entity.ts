import { ForbiddenError } from '../errors/forbidden.error';
import {
  Email,
  Name,
  Password,
  UUID,
  PermissionAction,
  PermissionSubject,
} from '../value-objects';
import { RoleEntity } from './role.entity';

export class AccountEntity {
  private readonly id: UUID;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private name: Name;
  private email: Email;
  private password: Password;
  private role: RoleEntity | null;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    createdAt: Date,
    updatedAt: Date,
    role?: RoleEntity,
  ) {
    this.id = new UUID(id);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.name = new Name(name);
    this.email = new Email(email);
    this.password = new Password(password);
    this.role = role ?? null;
  }

  static create(
    name: string,
    email: string,
    password: string,
    role: RoleEntity,
  ): AccountEntity {
    const id = crypto.randomUUID();
    return new AccountEntity(
      id,
      name,
      email,
      password,
      new Date(),
      new Date(),
      role,
    );
  }

  updateInformation(
    allowedBy: AccountEntity,
    name?: string,
    email?: string,
  ): void {
    if (
      !allowedBy
        .getRole()
        ?.hasPermission(PermissionAction.UPDATE, PermissionSubject.ACCOUNT)
    ) {
      throw new ForbiddenError(
        'You are not allowed to update the account information',
      );
    }

    let changed = false;

    if (name) {
      this.name = new Name(name);
      changed = true;
    }
    if (email) {
      this.email = new Email(email);
      changed = true;
    }

    if (changed) this.updatedAt = new Date();
  }

  changePassword(allowedBy: AccountEntity, newPassword: string): void {
    if (!allowedBy.equals(this)) {
      throw new ForbiddenError(
        'You are not allowed to update the account password',
      );
    }

    this.password = new Password(newPassword);
    this.updatedAt = new Date();
  }

  getId(): string {
    return this.id.getValue();
  }

  getName(): string {
    return this.name.getValue();
  }

  getEmail(): string {
    return this.email.getValue();
  }

  getPassword(): string {
    return this.password.getValue();
  }

  getRole(): RoleEntity | null {
    return this.role;
  }

  setRole(allowedBy: AccountEntity, role: RoleEntity): void {
    if (
      !allowedBy
        .getRole()
        ?.hasPermission(PermissionAction.UPDATE, PermissionSubject.ACCOUNT)
    ) {
      throw new ForbiddenError(
        'You are not allowed to update the account role',
      );
    }

    this.role = role;
    this.updatedAt = new Date();
  }

  private equals(account: AccountEntity): boolean {
    return this.getId() === account.getId();
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
