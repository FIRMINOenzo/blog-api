import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { ValueObject } from './value-object.interface';

export class Password implements ValueObject<string> {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  private validate(value: string): void {
    if (value.length < 8) {
      throw new ValueObjectValidationError(
        'Password must be at least 8 characters long',
      );
    }
    if (!/[a-z]/.test(value)) {
      throw new ValueObjectValidationError(
        'Password must contain at least one lowercase letter',
      );
    }
    if (!/[A-Z]/.test(value)) {
      throw new ValueObjectValidationError(
        'Password must contain at least one uppercase letter',
      );
    }
    if (!/\d/.test(value)) {
      throw new ValueObjectValidationError(
        'Password must contain at least one number',
      );
    }
  }
}
