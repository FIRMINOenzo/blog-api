import { RoleRepository } from 'src/domain/repositories/role.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { DbRoleEntity } from '../database/entities/db-role.entity';
import { Repository } from 'typeorm';
import { RoleEntity } from 'src/domain/entities/role.entity';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
  UUID,
} from 'src/domain/value-objects';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DbRoleRepository implements RoleRepository {
  constructor(
    @InjectRepository(DbRoleEntity)
    private readonly repository: Repository<DbRoleEntity>,
  ) {}
  async findAll(): Promise<RoleEntity[]> {
    const dbRoles = await this.repository.find({
      relations: ['permissions'],
    });
    return dbRoles.map((dbRole) => this.mapToEntity(dbRole));
  }

  private mapToEntity(dbRole: DbRoleEntity): RoleEntity {
    const permissions = dbRole.permissions?.map(
      (permission) =>
        new Permission(
          permission.action as PermissionAction,
          permission.subject as PermissionSubject,
        ),
    );
    return new RoleEntity(dbRole.id, dbRole.name, permissions);
  }

  async findById(id: UUID): Promise<RoleEntity | null> {
    const dbRole = await this.repository.findOne({
      where: { id: id.getValue() },
      relations: ['permissions'],
    });
    if (!dbRole) return null;
    return this.mapToEntity(dbRole);
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const dbRole = await this.repository.findOne({
      where: { name },
      relations: ['permissions'],
    });
    if (!dbRole) return null;
    return this.mapToEntity(dbRole);
  }
}
