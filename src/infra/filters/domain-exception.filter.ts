import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { NotFoundError } from 'src/domain/errors/not-found.error';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import { ConflictError } from 'src/domain/errors/conflict.error';
import { ValueObjectValidationError } from 'src/domain/errors/value-object-validation.error';
import { UnauthorizedError } from 'src/domain/errors/unauthorized.error';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.isNestJSException(exception)
      ? { status: exception.getStatus(), message: exception.getResponse() }
      : this.mapDomainErrorToHttp(exception);

    const parsedMessage = this.parseErrorMessage(message);

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${parsedMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message: parsedMessage,
      error: this.getErrorName(exception),
      timestamp: new Date().toISOString(),
    });
  }

  private parseErrorMessage(message: unknown): string {
    if (typeof message === 'string') {
      return message;
    }
    if (
      typeof message === 'object' &&
      message !== null &&
      'message' in message
    ) {
      return message.message as string;
    }
    return JSON.stringify(message);
  }

  private mapDomainErrorToHttp(exception: unknown): {
    status: number;
    message: string;
  } {
    if (exception instanceof NotFoundError) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: exception.message,
      };
    }

    if (exception instanceof ForbiddenError) {
      return {
        status: HttpStatus.FORBIDDEN,
        message: exception.message,
      };
    }

    if (exception instanceof ConflictError) {
      return {
        status: HttpStatus.CONFLICT,
        message: exception.message,
      };
    }

    if (exception instanceof UnauthorizedError) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: exception.message,
      };
    }

    if (exception instanceof ValueObjectValidationError) {
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: exception.message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        exception instanceof Error
          ? exception.message
          : 'Internal server error',
    };
  }

  private getErrorName(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.name;
    }
    return 'Error';
  }

  private isNestJSException(exception: unknown): exception is HttpException {
    return exception instanceof HttpException;
  }
}
