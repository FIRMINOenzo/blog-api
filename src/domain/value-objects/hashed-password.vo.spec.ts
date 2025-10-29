import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { HashedPassword } from './hashed-password.vo';

describe('Hashed Password Value Object', () => {
  test('should create a valid hashed password', () => {
    const hashedPassword = new HashedPassword('1234567890');
    expect(hashedPassword.getValue()).toBe('1234567890');
  });

  test('should throw an error when creating a hashed password with an empty value', () => {
    expect(() => new HashedPassword('')).toThrow(
      new ValueObjectValidationError('Hashed password cannot be empty'),
    );
  });
});
