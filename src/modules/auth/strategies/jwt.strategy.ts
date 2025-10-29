import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { AccountRepository } from 'src/domain/repositories/account.repository';
import { AccountEntity } from 'src/domain/entities/account.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AccountEntity> {
    const account = await this.accountRepository.findById(payload.sub);

    if (!account) {
      throw new UnauthorizedException('Invalid token');
    }

    return account;
  }
}
