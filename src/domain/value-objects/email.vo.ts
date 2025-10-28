import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { ValueObject } from './value-object.interface';

export class Email implements ValueObject<string> {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  private validate(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValueObjectValidationError('Invalid email address');
    }
  }
}
