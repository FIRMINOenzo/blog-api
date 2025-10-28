import { PermissionSubject } from '../entities/permission.entity';
import { ValueObjectValidationError } from '../errors/value-object-validation.error';

export class PermissionSubjectFactory {
  static create(subject: string): PermissionSubject {
    switch (subject) {
      case 'ACCOUNT':
        return PermissionSubject.ACCOUNT;
      case 'USER':
        return PermissionSubject.USER;
      default:
        throw new ValueObjectValidationError('Invalid permission subject');
    }
  }
}
