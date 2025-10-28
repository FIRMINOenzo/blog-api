import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { Name } from './name.vo';

describe('Name Value Object', () => {
  test.each(['John Doe', 'John Doe 2°', '1234 Doe', 'J'])(
    'should create a valid name: %s',
    (name) => {
      const nameVO = new Name(name);
      expect(nameVO.getValue()).toBe(name);
    },
  );

  test.each([''])(
    'should throw an error if the name is invalid: %s',
    (name) => {
      expect(() => new Name(name)).toThrow(
        new ValueObjectValidationError(
          'Name must be at least 1 character long',
        ),
      );
    },
  );
});
