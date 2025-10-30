import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { ValueObject } from './value-object.interface';

export class Content implements ValueObject<string> {
  private readonly value: string;
  private static readonly MIN_LENGTH = 100;
  private static readonly MAX_LENGTH = 50000;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValueObjectValidationError('Content cannot be empty');
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length < Content.MIN_LENGTH) {
      throw new ValueObjectValidationError(
        `Content must be at least ${Content.MIN_LENGTH} characters long`,
      );
    }

    if (trimmedValue.length > Content.MAX_LENGTH) {
      throw new ValueObjectValidationError(
        `Content must be at most ${Content.MAX_LENGTH} characters long`,
      );
    }
  }
}
