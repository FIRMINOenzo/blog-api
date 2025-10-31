import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRolesAndPermissions1704000000001
  implements MigrationInterface
{
  name = 'SeedRolesAndPermissions1704000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissions = [
      { subject: 'ACCOUNT', action: 'CREATE' },
      { subject: 'ACCOUNT', action: 'READ' },
      { subject: 'ACCOUNT', action: 'UPDATE' },
      { subject: 'ACCOUNT', action: 'DELETE' },
      { subject: 'ARTICLE', action: 'CREATE' },
      { subject: 'ARTICLE', action: 'READ' },
      { subject: 'ARTICLE', action: 'UPDATE' },
      { subject: 'ARTICLE', action: 'DELETE' },
    ];
    const permissionIds: { [key: string]: string } = {};

    for (const perm of permissions) {
      const result = (await queryRunner.query(
        `INSERT INTO "permissions" ("subject", "action") VALUES ($1, $2) RETURNING "id"`,
        [perm.subject, perm.action],
      )) as { id: string }[];
      permissionIds[`${perm.action}:${perm.subject}`] = result[0].id;
    }

    const adminRoleResult = (await queryRunner.query(
      `INSERT INTO "roles" ("id", "name") VALUES ('ca73df2c-f18d-4d81-b119-565da3ad58f2', 'ADMIN') RETURNING "id"`,
    )) as { id: string }[];
    const adminRoleId = adminRoleResult[0].id;

    const editorRoleResult = (await queryRunner.query(
      `INSERT INTO "roles" ("id", "name") VALUES ('062f8c5b-9bbc-4705-8b65-4de5823996a7', 'EDITOR') RETURNING "id"`,
    )) as { id: string }[];
    const editorRoleId = editorRoleResult[0].id;

    const readerRoleResult = (await queryRunner.query(
      `INSERT INTO "roles" ("id", "name") VALUES ('e7c7b813-d12a-4844-a5bd-63b44d64ee6e', 'READER') RETURNING "id"`,
    )) as { id: string }[];
    const readerRoleId = readerRoleResult[0].id;

    for (const permId of Object.values(permissionIds)) {
      await queryRunner.query(
        `INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ($1, $2)`,
        [adminRoleId, permId],
      );
    }

    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ($1, $2)`,
      [editorRoleId, permissionIds['CREATE:ARTICLE']],
    );
    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ($1, $2)`,
      [editorRoleId, permissionIds['READ:ARTICLE']],
    );
    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ($1, $2)`,
      [editorRoleId, permissionIds['UPDATE:ARTICLE']],
    );
    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ($1, $2)`,
      [editorRoleId, permissionIds['DELETE:ARTICLE']],
    );

    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ($1, $2)`,
      [readerRoleId, permissionIds['READ:ARTICLE']],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "role_permissions"`);
    await queryRunner.query(`DELETE FROM "roles"`);
    await queryRunner.query(`DELETE FROM "permissions"`);
  }
}
