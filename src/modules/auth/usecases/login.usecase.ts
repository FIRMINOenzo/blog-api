import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AccountRepository } from 'src/domain/repositories/account.repository';
import { HashPasswordService } from 'src/infra/services/hash-password.service';
import { JwtPayload } from '../strategies/jwt.strategy';
import { Email, Password } from 'src/domain/value-objects';
import { UnauthorizedError } from 'src/domain/errors/unauthorized.error';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
    private readonly hashPasswordService: HashPasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const email = new Email(input.email);
    const password = new Password(input.password);

    const account = await this.accountRepository.findByEmail(email.getValue());
    if (!account) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await this.hashPasswordService.compare(
      password.getValue(),
      account.getPassword(),
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
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
