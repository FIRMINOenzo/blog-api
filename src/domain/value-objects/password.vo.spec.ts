import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { Password } from './password.vo';

describe('Password Value Object', () => {
  test.each([
    ['Password123', 'Password123'],
    ['Password123@', 'Password123@'],
    ['!G8"U5i0ub2z', '!G8"U5i0ub2z'],
    ['RrE4,@8?l6Ov+AeRi}A&wXd+qr#pwB', 'RrE4,@8?l6Ov+AeRi}A&wXd+qr#pwB'],
  ])('should create a valid password: %s', (password, expected) => {
    const passwordVO = new Password(password);
    expect(passwordVO.getValue()).toBe(expected);
  });

  test.each([
    ['', 'Password must be at least 8 characters long'],
    ['1234567', 'Password must be at least 8 characters long'],
    ['password123', 'Password must contain at least one uppercase letter'],
    ['PASSWORD123', 'Password must contain at least one lowercase letter'],
    ['noNumberHere', 'Password must contain at least one number'],
  ])(
    'should throw an error if the password is invalid: %s',
    (password, errorMessage) => {
      expect(() => new Password(password)).toThrow(
        new ValueObjectValidationError(errorMessage),
      );
    },
  );
});
