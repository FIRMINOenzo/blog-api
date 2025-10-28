import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { UUID } from './uuid.vo';

describe('UUID Value Object', () => {
  const randomUUID = crypto.randomUUID();

  test.each([
    [
      '0e2451c3-fc42-40d6-917a-57d447e436a6',
      '0e2451c3-fc42-40d6-917a-57d447e436a6',
    ],
    [
      '6839b3fc-f5b3-42b9-b2fc-ffe030cdf568',
      '6839b3fc-f5b3-42b9-b2fc-ffe030cdf568',
    ],
    [randomUUID, randomUUID],
  ])('should create a valid UUID: %s', (uuid, expected) => {
    const uuidVO = new UUID(uuid);
    expect(uuidVO.getValue()).toBe(expected);
  });

  test.each([
    ['123', 'Invalid UUID format'],
    ['', 'Invalid UUID format'],
  ])(
    'should throw an error if the UUID is invalid: %s',
    (uuid, errorMessage) => {
      expect(() => new UUID(uuid)).toThrow(
        new ValueObjectValidationError(errorMessage),
      );
    },
  );
});
