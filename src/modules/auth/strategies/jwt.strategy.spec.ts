import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AccountRepository } from 'src/domain/repositories/account.repository';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from 'src/domain/value-objects';
import { UnauthorizedError } from 'src/domain/errors/unauthorized.error';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  const mockAccountRepository: Partial<AccountRepository> = {
    findById: jest.fn(),
  };
  const mockConfigService: Partial<ConfigService> = {
    getOrThrow: jest.fn().mockReturnValue('test-secret'),
  };

  const mockRole = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'ADMIN',
    [new Permission(PermissionAction.CREATE, PermissionSubject.ACCOUNT)],
  );
  const mockAccount = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440001',
    'Test User',
    'test@example.com',
    '$2b$10$hashedpassword',
    new Date(),
    new Date(),
    mockRole,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jwtStrategy = new JwtStrategy(
      mockConfigService as ConfigService,
      mockAccountRepository as AccountRepository,
    );
  });

  describe('validate', () => {
    const payload = {
      sub: '550e8400-e29b-41d4-a716-446655440001',
      email: 'test@example.com',
      name: 'Test User',
      role: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'ADMIN',
      },
    };

    it('should return account entity when user exists', async () => {
      const findByIdSpy = jest.spyOn(mockAccountRepository, 'findById');
      findByIdSpy.mockResolvedValueOnce(mockAccount);

      const result = await jwtStrategy.validate(payload);

      expect(findByIdSpy).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440001',
      );
      expect(result).toBe(mockAccount);
      expect(result.getId()).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result.getEmail()).toBe('test@example.com');
      expect(result.getRole()?.getName()).toBe('ADMIN');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const findByIdSpy = jest.spyOn(mockAccountRepository, 'findById');
      findByIdSpy.mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        new UnauthorizedError('User not found or deleted'),
      );
    });
  });
});
