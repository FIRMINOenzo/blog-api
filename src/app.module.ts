import { Module } from '@nestjs/common';
import { AccountModule } from './modules/account/account.module';
import { DatabaseModule } from './infra/database/database.module';

@Module({
  imports: [DatabaseModule, AccountModule],
})
export class AppModule {}
