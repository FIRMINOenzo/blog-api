import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { ValueObject } from './value-object.interface';

export class UUID implements ValueObject<string> {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  private validate(value: string): void {
    if (
      !/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(
        value,
      )
    ) {
      throw new ValueObjectValidationError('Invalid UUID format');
    }
  }
}
