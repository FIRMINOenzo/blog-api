import { PermissionActionFactory } from '../factories/permission-action.factory';
import { PermissionSubjectFactory } from '../factories/permission-subject.factory';
import { UUID } from '../value-objects';

export class PermissionEntity {
  private readonly id: UUID;
  private readonly action: PermissionAction;
  private readonly subject: PermissionSubject;

  constructor(
    id: string,
    action: PermissionAction,
    subject: PermissionSubject,
  ) {
    this.id = new UUID(id);
    this.action = PermissionActionFactory.create(action);
    this.subject = PermissionSubjectFactory.create(subject);
  }

  getId(): string {
    return this.id.getValue();
  }

  getAction(): PermissionAction {
    return this.action;
  }

  getSubject(): PermissionSubject {
    return this.subject;
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
