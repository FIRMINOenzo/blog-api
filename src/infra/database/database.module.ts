import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DbAccountEntity } from './entities/db-account.entity';
import { DbRoleEntity } from './entities/db-role.entity';
import { DbPermissionEntity } from './entities/db-permission.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'blog_api'),
        entities: [DbAccountEntity, DbRoleEntity, DbPermissionEntity],
        synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
        migrations: ['dist/infra/database/migrations/*.js'],
        migrationsRun: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
