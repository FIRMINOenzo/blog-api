import { Injectable } from '@nestjs/common';
import { RoleEntity } from 'src/domain/entities/role.entity';
import { RoleRepository } from 'src/domain/repositories/role.repository';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
  UUID,
} from 'src/domain/value-objects';

@Injectable()
export class InMemoryRoleRepository implements RoleRepository {
  private readonly permissions = {
    createAccount: new Permission(
      PermissionAction.CREATE,
      PermissionSubject.ACCOUNT,
    ),
    readAccount: new Permission(
      PermissionAction.READ,
      PermissionSubject.ACCOUNT,
    ),
    updateAccount: new Permission(
      PermissionAction.UPDATE,
      PermissionSubject.ACCOUNT,
    ),
    deleteAccount: new Permission(
      PermissionAction.DELETE,
      PermissionSubject.ACCOUNT,
    ),
    createArticle: new Permission(
      PermissionAction.CREATE,
      PermissionSubject.ARTICLE,
    ),
    readArticle: new Permission(
      PermissionAction.READ,
      PermissionSubject.ARTICLE,
    ),
    updateArticle: new Permission(
      PermissionAction.UPDATE,
      PermissionSubject.ARTICLE,
    ),
    deleteArticle: new Permission(
      PermissionAction.DELETE,
      PermissionSubject.ARTICLE,
    ),
  };

  private readonly roles = {
    '1b3a301b-3dc0-4dcc-bd6e-05bdfba345f3': new RoleEntity(
      crypto.randomUUID(),
      'ADMIN',
      [
        this.permissions.createAccount,
        this.permissions.readAccount,
        this.permissions.updateAccount,
        this.permissions.deleteAccount,
        this.permissions.createArticle,
        this.permissions.readArticle,
        this.permissions.updateArticle,
        this.permissions.deleteArticle,
      ],
    ),

    'e7f83766-4533-4fd5-887f-2285a721cb3f': new RoleEntity(
      crypto.randomUUID(),
      'EDITOR',
      [
        this.permissions.createArticle,
        this.permissions.readArticle,
        this.permissions.updateArticle,
        this.permissions.deleteArticle,
      ],
    ),

    'abb27e14-9ee1-4ff6-b5d8-74d44b5bdf1e': new RoleEntity(
      crypto.randomUUID(),
      'READER',
      [this.permissions.readArticle],
    ),
  };

  findById(id: UUID): Promise<RoleEntity | null> {
    return Promise.resolve(this.roles[id.getValue()] ?? null);
  }

  findByName(name: string): Promise<RoleEntity | null> {
    return Promise.resolve(
      Object.values(this.roles).find((role) => role.getName() === name) ?? null,
    );
  }

  findAll(): Promise<RoleEntity[]> {
    return Promise.resolve(Object.values(this.roles));
  }
}
