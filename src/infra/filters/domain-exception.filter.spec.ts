import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { NotFoundError } from 'src/domain/errors/not-found.error';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import { ConflictError } from 'src/domain/errors/conflict.error';
import { ValueObjectValidationError } from 'src/domain/errors/value-object-validation.error';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: jest.Mocked<Response>;
  let mockRequest: jest.Mocked<Request>;
  let mockHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DomainExceptionFilter],
    }).compile();

    filter = module.get<DomainExceptionFilter>(DomainExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Response>;

    mockRequest = {
      method: 'POST',
      url: '/test',
    } as unknown as jest.Mocked<Request>;

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should map NotFoundError to 404', () => {
    const exception = new NotFoundError('Resource not found');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource not found',
        error: 'NotFoundError',
      }),
    );
  });

  it('should map ForbiddenError to 403', () => {
    const exception = new ForbiddenError('Access forbidden');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access forbidden',
        error: 'ForbiddenError',
      }),
    );
  });

  it('should map ConflictError to 409', () => {
    const exception = new ConflictError('Resource already exists');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: 'Resource already exists',
        error: 'ConflictError',
      }),
    );
  });

  it('should map ValueObjectValidationError to 422', () => {
    const exception = new ValueObjectValidationError('Invalid value');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Invalid value',
        error: 'ValueObjectValidationError',
      }),
    );
  });

  it('should handle NestJS HttpException', () => {
    const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should map unknown errors to 500', () => {
    const exception = new Error('Unknown error');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unknown error',
      }),
    );
  });

  it('should handle generic Error instances', () => {
    const exception = new Error('Test error');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
    );
  });
});
