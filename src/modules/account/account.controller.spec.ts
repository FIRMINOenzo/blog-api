import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { CreateAccountUseCase } from './usecases/create-account.usecase';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from 'src/domain/value-objects';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';

describe('AccountController', () => {
  let controller: AccountController;
  let createAccountUseCase: jest.Mocked<CreateAccountUseCase>;

  const ADMIN_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'ADMIN',
    [new Permission(PermissionAction.CREATE, PermissionSubject.ACCOUNT)],
  );

  const CURRENT_USER = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440001',
    'Admin User',
    'admin@example.com',
    'hashed-password',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    ADMIN_ROLE,
  );

  const VALID_CREATE_DTO: CreateAccountDto = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123',
    roleId: '550e8400-e29b-41d4-a716-446655440002',
  };

  beforeEach(async () => {
    const mockCreateAccountUseCase: Partial<CreateAccountUseCase> = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: CreateAccountUseCase,
          useValue: mockCreateAccountUseCase,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    createAccountUseCase = module.get(CreateAccountUseCase);
  });

  describe('create', () => {
    it('should call CreateAccountUseCase with current user and input', async () => {
      createAccountUseCase.execute.mockResolvedValue({ token: 'jwt-token' });

      await controller.create(VALID_CREATE_DTO, CURRENT_USER);

      expect(createAccountUseCase.execute).toHaveBeenCalledWith(
        CURRENT_USER,
        VALID_CREATE_DTO,
      );
      expect(createAccountUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return token from CreateAccountUseCase', async () => {
      const expectedOutput = { token: 'new-account-jwt-token' };
      createAccountUseCase.execute.mockResolvedValue(expectedOutput);

      const result = await controller.create(VALID_CREATE_DTO, CURRENT_USER);

      expect(result).toEqual(expectedOutput);
    });

    it('should propagate error from use case', async () => {
      const error = new ForbiddenError('Insufficient permissions');
      createAccountUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.create(VALID_CREATE_DTO, CURRENT_USER),
      ).rejects.toThrow(new ForbiddenError('Insufficient permissions'));
    });
  });
});
