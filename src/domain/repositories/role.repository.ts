import { RoleEntity } from '../entities/role.entity';
import { UUID } from '../value-objects';

export interface RoleRepository {
  findById(id: UUID): Promise<RoleEntity | null>;
  findByName(name: string): Promise<RoleEntity | null>;
  findAll(): Promise<RoleEntity[]>;
}
