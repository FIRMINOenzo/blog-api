import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new JwtAuthGuard(reflector);
  });

  describe('canActivate', () => {
    describe('when route is public', () => {
      it('should allow access without authentication', () => {
        const mockContext = createMockExecutionContext();
        reflector.getAllAndOverride.mockReturnValue(true);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
          mockContext.getHandler(),
          mockContext.getClass(),
        ]);
      });

      it('should not call parent canActivate for public routes', async () => {
        const mockContext = createMockExecutionContext();
        reflector.getAllAndOverride.mockReturnValue(true);
        const superCanActivateSpy = jest.spyOn(
          Object.getPrototypeOf(JwtAuthGuard.prototype),
          'canActivate',
        );

        await guard.canActivate(mockContext);

        expect(superCanActivateSpy).not.toHaveBeenCalled();
      });
    });

    describe('when route is protected', () => {
      it('should delegate to parent AuthGuard for authentication', () => {
        const mockContext = createMockExecutionContext();
        reflector.getAllAndOverride.mockReturnValue(false);
        const superCanActivateSpy = jest
          .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
          .mockReturnValue(true);

        const result = guard.canActivate(mockContext);

        expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
        expect(result).toBe(true);
      });

      it('should check both handler and class for public metadata', async () => {
        const mockContext = createMockExecutionContext();
        reflector.getAllAndOverride.mockReturnValue(false);
        jest
          .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
          .mockReturnValue(true);

        await guard.canActivate(mockContext);

        expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
          mockContext.getHandler(),
          mockContext.getClass(),
        ]);
      });
    });

    describe('when route has no metadata', () => {
      it('should treat as protected route', async () => {
        const mockContext = createMockExecutionContext();
        reflector.getAllAndOverride.mockReturnValue(undefined);
        const superCanActivateSpy = jest
          .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
          .mockReturnValue(true);

        await guard.canActivate(mockContext);

        expect(superCanActivateSpy).toHaveBeenCalled();
      });
    });
  });
});

function createMockExecutionContext(): ExecutionContext {
  const mockHandler = jest.fn();
  const mockClass = jest.fn();

  return {
    getHandler: () => mockHandler,
    getClass: () => mockClass,
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  } as unknown as ExecutionContext;
}
