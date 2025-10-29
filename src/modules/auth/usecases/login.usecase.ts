import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AccountRepository } from 'src/domain/repositories/account.repository';
import { HashPasswordService } from 'src/infra/services/hash-password.service';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
    private readonly hashPasswordService: HashPasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const account = await this.accountRepository.findByEmail(input.email);
    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashPasswordService.compare(
      input.password,
      account.getPassword(),
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: account.getId(),
      email: account.getEmail(),
      name: account.getName(),
      role: {
        id: account.getRole()!.getId(),
        name: account.getRole()!.getName(),
      },
    };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }
}

export class LoginInput {
  readonly email: string;
  readonly password: string;
}

export class LoginOutput {
  readonly token: string;
}
