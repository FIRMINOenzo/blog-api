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
    const pattern =
      '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
    const regex = new RegExp(pattern, 'gm');
    if (!regex.test(value)) {
      throw new ValueObjectValidationError('Invalid UUID format');
    }
  }
}
