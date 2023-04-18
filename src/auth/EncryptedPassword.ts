import * as bcrypt from 'bcrypt';

export class EncryptedPassword {
  private readonly password: string;

  getPassword() {
    return this.password;
  }

  private constructor(password: string) {
    this.password = password;
  }

  static from(hashedPassword: string) {
    return new EncryptedPassword(hashedPassword);
  }

  static encryptFrom(plainPassword: string) {
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);
    return new EncryptedPassword(hashedPassword);
  }

  equals(plainPassword: string) {
    return bcrypt.compareSync(plainPassword, this.password);
  }
}
