import { Email, Name, Password, UUID } from '../value-objects';

export class AccountEntity {
  private readonly id: UUID;
  private name: Name;
  private email: Email;
  private password: Password;

  constructor(id: string, name: string, email: string, password: string) {
    this.id = new UUID(id);
    this.name = new Name(name);
    this.email = new Email(email);
    this.password = new Password(password);
  }

  static create(name: string, email: string, password: string): AccountEntity {
    const id = crypto.randomUUID();
    return new AccountEntity(id, name, email, password);
  }

  updateInformation(name: string, email: string, password: string): void {
    this.name = new Name(name);
    this.email = new Email(email);
    this.password = new Password(password);
  }

  getId(): string {
    return this.id.getValue();
  }

  getName(): string {
    return this.name.getValue();
  }

  getEmail(): string {
    return this.email.getValue();
  }

  getPassword(): string {
    return this.password.getValue();
  }
}
