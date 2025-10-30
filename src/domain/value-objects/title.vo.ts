import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { ValueObject } from './value-object.interface';

export class Title implements ValueObject<string> {
  private readonly value: string;
  private static readonly MIN_LENGTH = 5;
  private static readonly MAX_LENGTH = 150;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValueObjectValidationError('Title cannot be empty');
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length < Title.MIN_LENGTH) {
      throw new ValueObjectValidationError(
        `Title must be at least ${Title.MIN_LENGTH} characters long`,
      );
    }

    if (trimmedValue.length > Title.MAX_LENGTH) {
      throw new ValueObjectValidationError(
        `Title must be at most ${Title.MAX_LENGTH} characters long`,
      );
    }
  }
}
