import { PermissionAction } from '../entities/permission.entity';
import { ValueObjectValidationError } from '../errors/value-object-validation.error';

export class PermissionActionFactory {
  static create(action: string): PermissionAction {
    switch (action) {
      case 'CREATE':
        return PermissionAction.CREATE;
      case 'READ':
        return PermissionAction.READ;
      case 'UPDATE':
        return PermissionAction.UPDATE;
      case 'DELETE':
        return PermissionAction.DELETE;
      default:
        throw new ValueObjectValidationError('Invalid permission action');
    }
  }
}
