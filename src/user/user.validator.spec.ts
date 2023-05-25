import { IsBcryptEncryptedConstraint } from './user.validator';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserErrorMessage } from './user.error-message';

describe('UserValidator', () => {
  const bcryptEncryptedValidator = new IsBcryptEncryptedConstraint();

  describe('validate', () => {
    it('Bcrypt로 인코딩된 문자열이면 true 를 반환', () => {
      // given
      const hashedString = bcrypt.hashSync('password', 10);

      // when
      const result = bcryptEncryptedValidator.validate(hashedString);

      // then
      expect(result).toBe(true);
    });

    it('Bcrypt로 인코딩된 문자열이 아니면 false 를 반환', () => {
      // given
      const strListToTest = ['1234', 'abcd', '가나다라', '1234abcd', ''];
      strListToTest.push(
        crypto.createHash('sha256').update('password').digest('hex'),
      );

      // when
      // then
      strListToTest.forEach((invalidString) => {
        // when
        const result = bcryptEncryptedValidator.validate(invalidString);

        // then
        expect(result).toBe(false);
      });
    });
  });

  describe('defaultMessage', () => {
    it('기본 메시지를 반환', () => {
      // given
      // when
      const result = bcryptEncryptedValidator.defaultMessage();

      // then
      expect(result).toBe(UserErrorMessage.NOT_BCRYPT_ENCRYPTED);
    });
  });
});
