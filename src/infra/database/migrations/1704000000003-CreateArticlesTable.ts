import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticlesTable1704000000003 implements MigrationInterface {
  name = 'CreateArticlesTable1704000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" uuid NOT NULL,
        "title" character varying(150) NOT NULL,
        "content" text NOT NULL,
        "slug" character varying(150) NOT NULL,
        "author_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "is_deleted" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_articles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_articles_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD CONSTRAINT "FK_articles_author"
      FOREIGN KEY ("author_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_articles_author" ON "articles" ("author_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_articles_slug" ON "articles" ("slug")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_articles_created_at" ON "articles" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_articles_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_articles_slug"`);
    await queryRunner.query(`DROP INDEX "IDX_articles_author"`);

    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_articles_author"`,
    );

    await queryRunner.query(`DROP TABLE "articles"`);
  }
}
