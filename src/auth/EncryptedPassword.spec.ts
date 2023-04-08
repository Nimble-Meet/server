import { EncryptedPassword } from './EncryptedPassword';

describe('EncryptedPassword', () => {
  const plainPassword = 'password123';
  let encryptedPassword: EncryptedPassword;

  beforeEach(() => {
    encryptedPassword = EncryptedPassword.encryptFrom(plainPassword);
  });

  it('encryptFrom: 원본 비밀번호가 암호화된 상태로 생성되어야 함', () => {
    expect(encryptedPassword.getPassword()).not.toEqual(plainPassword);
  });

  it('from: 암호화된 비밀번호로부터 생성', () => {
    const hashedPassword = encryptedPassword.getPassword();
    const result = EncryptedPassword.from(hashedPassword);
    expect(result).toEqual(encryptedPassword);
  });

  it('equals: 적절한 원본 비밀번호가 주어지면 true', () => {
    const result = encryptedPassword.equals(plainPassword);
    expect(result).toBe(true);
  });

  it('equals: 일치하지 않는 원본 비밀번호가 주어지면 false', () => {
    const incorrectPassword = 'invalid-password123';
    const result = encryptedPassword.equals(incorrectPassword);
    expect(result).toBe(false);
  });
});
