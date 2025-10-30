import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginUseCase } from './usecases/login.usecase';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;

  const VALID_LOGIN_DTO: LoginDto = {
    email: 'user@example.com',
    password: 'SecurePass123',
  };

  beforeEach(async () => {
    const mockLoginUseCase: Partial<LoginUseCase> = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get(LoginUseCase);
  });

  describe('login', () => {
    it('should call LoginUseCase with correct input', async () => {
      loginUseCase.execute.mockResolvedValue({ token: 'jwt-token' });

      await controller.login(VALID_LOGIN_DTO);

      expect(loginUseCase.execute).toHaveBeenCalledWith(VALID_LOGIN_DTO);
      expect(loginUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return token from LoginUseCase', async () => {
      const expectedOutput = { token: 'generated-jwt-token-123' };
      loginUseCase.execute.mockResolvedValue(expectedOutput);

      const result = await controller.login(VALID_LOGIN_DTO);

      expect(result).toEqual(expectedOutput);
    });

    it('should propagate errors from LoginUseCase', async () => {
      const error = new Error('Invalid credentials');
      loginUseCase.execute.mockRejectedValue(error);

      await expect(controller.login(VALID_LOGIN_DTO)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
