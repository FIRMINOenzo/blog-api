import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { LoginUseCase } from './usecases/login.usecase';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HashPasswordService } from 'src/infra/services/hash-password.service';
import { DbAccountRepository } from 'src/infra/repositories/db-account.repository';
import { DbAccountEntity } from 'src/infra/database/entities/db-account.entity';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRES_IN', 3600 * 24),
        },
      }),
    }),
    TypeOrmModule.forFeature([DbAccountEntity]),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    JwtStrategy,
    JwtAuthGuard,
    HashPasswordService,
    {
      provide: 'AccountRepository',
      useClass: DbAccountRepository,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
