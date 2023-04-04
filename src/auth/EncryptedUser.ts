import * as bcrypt from 'bcrypt';

export class EncryptedUser {
  email: string;
  nickname: string;
  password: string;

  private constructor(partial: Partial<EncryptedUser>) {
    Object.assign(this, partial);
  }
  static async of(userInfos: Partial<EncryptedUser>) {
    const hashedPassword = await bcrypt.hash(userInfos.password, 10);
    return new EncryptedUser({
      ...userInfos,
      password: hashedPassword,
    });
  }
}
