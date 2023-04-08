import * as bcrypt from 'bcrypt';

export class EncryptedPassword {
  private readonly password: string;

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

  getPassword() {
    return this.password;
  }

  equals(plainPassword: string) {
    return bcrypt.compareSync(plainPassword, this.password);
  }
}
