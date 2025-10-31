import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/infra/database/data-source';

let dataSource: DataSource;

beforeAll(async () => {
  dataSource = await AppDataSource.initialize();
  await dataSource.runMigrations();
});

afterAll(async () => {
  if (dataSource?.isInitialized) {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  }
});

afterEach(async () => {
  if (dataSource?.isInitialized) {
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      if (entity.tableName === 'roles' || entity.tableName === 'permissions') {
        continue;
      }
      const repository = dataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }
  }
});

export { dataSource };
