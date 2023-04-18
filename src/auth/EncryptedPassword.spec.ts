import { EncryptedPassword } from 'src/auth/EncryptedPassword';

describe('EncryptedPassword', () => {
  describe('encryptFrom', () => {
    it('원본 비밀번호를 암호화해서 객체를 생성한다.', () => {
      // given
      const plainPassword = 'password123';

      // when
      const encryptedPassword = EncryptedPassword.encryptFrom(plainPassword);

      // then
      expect(encryptedPassword.getPassword()).not.toEqual(plainPassword);
    });
  });

  describe('from', () => {
    it('암호화된 비밀번호를 받아서 그대로 객체를 생성한다.', () => {
      // given
      const plainPassword = 'password123';
      const encryptedPassword =
        EncryptedPassword.encryptFrom(plainPassword).getPassword();

      // when
      const resultPassword = EncryptedPassword.from(encryptedPassword);

      // then
      expect(resultPassword.getPassword()).toEqual(encryptedPassword);
    });
  });

  describe('equals', () => {
    it('원본 비밀번호가 주어지면 true를 반환', () => {
      // given
      const plainPassword = 'password123';
      const encryptedPassword = EncryptedPassword.encryptFrom(plainPassword);

      // when
      // then
      expect(encryptedPassword.equals('password123')).toBe(true);
    });

    it('원본 비밀번호가 아닌 값이 주어지면 false를 반환', () => {
      // given
      const plainPassword = 'password123';
      const encryptedPassword = EncryptedPassword.encryptFrom(plainPassword);

      // when
      // then
      expect(encryptedPassword.equals('-----')).toBe(false);
    });
  });
});
