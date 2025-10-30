import { Module } from '@nestjs/common';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArticleModule } from './modules/article/article.module';
import { DatabaseModule } from './infra/database/database.module';

@Module({
  imports: [DatabaseModule, AuthModule, AccountModule, ArticleModule],
})
export class AppModule {}
