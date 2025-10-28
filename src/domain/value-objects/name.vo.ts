import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { ValueObject } from './value-object.interface';

export class Name implements ValueObject<string> {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  private validate(value: string): void {
    if (value.length < 1) {
      throw new ValueObjectValidationError(
        'Name must be at least 1 character long',
      );
    }
  }
}
