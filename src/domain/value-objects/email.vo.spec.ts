import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { Email } from './email.vo';

describe('Email Value Object', () => {
  test.each([
    ['test@example.com', 'test@example.com'],
    ['test@example.co.uk', 'test@example.co.uk'],
    ['test@example.com.br', 'test@example.com.br'],
    ['test@example.com.br', 'test@example.com.br'],
  ])('should create a valid email: %s', (email, expected) => {
    const emailVO = new Email(email);
    expect(emailVO.getValue()).toBe(expected);
  });

  test.each(['test', 'test@', 'test@example', '@example.com', ''])(
    'should throw an error if the email is invalid: %s',
    (email) => {
      expect(() => new Email(email)).toThrow(
        new ValueObjectValidationError('Invalid email address'),
      );
    },
  );
});
