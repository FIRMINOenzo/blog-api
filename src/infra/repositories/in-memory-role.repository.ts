import { Injectable } from '@nestjs/common';
import { RoleEntity } from 'src/domain/entities/role.entity';
import { RoleRepository } from 'src/domain/repositories/role.repository';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
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
    [crypto.randomUUID()]: new RoleEntity(crypto.randomUUID(), 'ADMIN', [
      this.permissions.createAccount,
      this.permissions.readAccount,
      this.permissions.updateAccount,
      this.permissions.deleteAccount,
      this.permissions.createArticle,
      this.permissions.readArticle,
      this.permissions.updateArticle,
      this.permissions.deleteArticle,
    ]),

    [crypto.randomUUID()]: new RoleEntity(crypto.randomUUID(), 'EDITOR', [
      this.permissions.createArticle,
      this.permissions.readArticle,
      this.permissions.updateArticle,
      this.permissions.deleteArticle,
    ]),

    [crypto.randomUUID()]: new RoleEntity(crypto.randomUUID(), 'READER', [
      this.permissions.readArticle,
    ]),
  };

  findById(id: string): Promise<RoleEntity | null> {
    return Promise.resolve(this.roles[id] ?? null);
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
