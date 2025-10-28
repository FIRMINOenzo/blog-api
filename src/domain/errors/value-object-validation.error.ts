export class ValueObjectValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValueObjectValidationError';
  }
}
