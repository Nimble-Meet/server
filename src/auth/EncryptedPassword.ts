import * as bcrypt from 'bcrypt';

export class EncryptedPassword {
  private readonly password: string;

  constructor(password: string) {
    this.password = password;
  }

  static async encryptFrom(plainPassword: string) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    return new EncryptedPassword(hashedPassword);
  }

  valueOf() {
    return this.password;
  }

  equals(plainPassword: string) {
    return bcrypt.compareSync(plainPassword, this.password);
  }
}
