import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedAdminUser1704000000002 implements MigrationInterface {
  name = 'SeedAdminUser1704000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminRoleResult = (await queryRunner.query(
      `SELECT id FROM "roles" WHERE name = 'ADMIN' LIMIT 1`,
    )) as { id: string }[];

    if (adminRoleResult.length === 0) {
      throw new Error('ADMIN role not found. Run seed migrations first.');
    }

    const adminRoleId = adminRoleResult[0].id;
    const hashedPassword = await bcrypt.hash('adminPass123', 10);
    const adminId = crypto.randomUUID();

    await queryRunner.query(
      `INSERT INTO "accounts" ("id", "name", "email", "password", "role_id", "created_at", "updated_at", "is_deleted")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), false)`,
      [
        adminId,
        'Administrator',
        'admin@example.com',
        hashedPassword,
        adminRoleId,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "accounts" WHERE email = 'admin@example.com'`,
    );
  }
}
