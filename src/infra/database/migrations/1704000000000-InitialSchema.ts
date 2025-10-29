import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704000000000 implements MigrationInterface {
  name = 'InitialSchema1704000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "subject" character varying(255) NOT NULL,
        "action" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "accounts" (
        "id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "role_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL,
        "updated_at" TIMESTAMP NOT NULL,
        "is_deleted" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_accounts_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions"
      ADD CONSTRAINT "FK_role_permissions_role"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "role_permissions"
      ADD CONSTRAINT "FK_role_permissions_permission"
      FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "accounts"
      ADD CONSTRAINT "FK_accounts_role"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_role_permissions_role" ON "role_permissions" ("role_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_role_permissions_permission" ON "role_permissions" ("permission_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_accounts_email" ON "accounts" ("email")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_accounts_role" ON "accounts" ("role_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_accounts_role"`);
    await queryRunner.query(`DROP INDEX "IDX_accounts_email"`);
    await queryRunner.query(`DROP INDEX "IDX_role_permissions_permission"`);
    await queryRunner.query(`DROP INDEX "IDX_role_permissions_role"`);

    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_accounts_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role"`,
    );

    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
