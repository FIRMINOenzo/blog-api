import { ValueObjectValidationError } from '../errors/value-object-validation.error';

export class Permission {
  private readonly action: PermissionAction;
  private readonly subject: PermissionSubject;

  constructor(action: PermissionAction, subject: PermissionSubject) {
    this.validate(action, subject);
    this.action = action;
    this.subject = subject;
  }

  getAction(): PermissionAction {
    return this.action;
  }

  getSubject(): PermissionSubject {
    return this.subject;
  }

  equals(other: Permission): boolean {
    if (!other) return false;
    return this.action === other.action && this.subject === other.subject;
  }

  toString(): string {
    return `${this.action}:${this.subject}`;
  }

  private validate(action: PermissionAction, subject: PermissionSubject): void {
    if (!action || !subject) {
      throw new ValueObjectValidationError(
        'Permission action and subject are required',
      );
    }

    if (!Object.values(PermissionAction).includes(action)) {
      throw new ValueObjectValidationError(
        `Invalid permission action: ${action}`,
      );
    }

    if (!Object.values(PermissionSubject).includes(subject)) {
      throw new ValueObjectValidationError(
        `Invalid permission subject: ${subject}`,
      );
    }
  }

  static create(
    action: PermissionAction,
    subject: PermissionSubject,
  ): Permission {
    return new Permission(action, subject);
  }
}

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum PermissionSubject {
  ACCOUNT = 'ACCOUNT',
  ARTICLE = 'ARTICLE',
}
