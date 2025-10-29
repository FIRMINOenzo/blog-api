import { HashPasswordService } from './hash-password.service';

describe('HashPasswordService', () => {
  let service: HashPasswordService;

  beforeEach(() => {
    service = new HashPasswordService();
  });

  it('should return true when password matches hash', async () => {
    const password = 'CorrectPassword123';
    const hashedPassword = await service.hash(password);

    const isMatch = await service.compare(password, hashedPassword);

    expect(isMatch).toBe(true);
  });

  it('should return false when password does not match hash', async () => {
    const correctPassword = 'CorrectPassword123';
    const wrongPassword = 'WrongPassword456';
    const hashedPassword = await service.hash(correctPassword);

    const isMatch = await service.compare(wrongPassword, hashedPassword);

    expect(isMatch).toBe(false);
  });

  it('should be case sensitive', async () => {
    const password = 'MyPassword';
    const differentCase = 'mypassword';
    const hashedPassword = await service.hash(password);

    const isMatch = await service.compare(differentCase, hashedPassword);

    expect(isMatch).toBe(false);
  });

  it('should return false for empty password against valid hash', async () => {
    const password = 'ValidPassword123';
    const hashedPassword = await service.hash(password);

    const isMatch = await service.compare('', hashedPassword);

    expect(isMatch).toBe(false);
  });

  it('should successfully hash and verify password in workflow', async () => {
    const originalPassword = 'UserPassword123!';

    const hashedForStorage = await service.hash(originalPassword);

    const isValidLogin = await service.compare(
      originalPassword,
      hashedForStorage,
    );

    expect(isValidLogin).toBe(true);
  });

  it('should reject wrong password in authentication workflow', async () => {
    const userPassword = 'CorrectPassword123';
    const attackerPassword = 'GuessedPassword456';

    const storedHash = await service.hash(userPassword);

    const isValidLogin = await service.compare(attackerPassword, storedHash);

    expect(isValidLogin).toBe(false);
  });
});
