import { Module } from '@nestjs/common';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './infra/database/database.module';

@Module({
  imports: [DatabaseModule, AuthModule, AccountModule],
})
export class AppModule {}
