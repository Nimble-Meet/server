import * as crypto from 'crypto';
import { IsSha256EncryptedConstraint } from './auth.validator';
import { ErrorMessage } from './enum/error-message.enum';

describe('AuthValidator', () => {
  const sha256EncryptedValidator = new IsSha256EncryptedConstraint();

  describe('validate', () => {
    it('SHA-256으로 인코딩된 문자열이면 true 를 반환', () => {
      // given
      const hashedString = crypto
        .createHash('sha256')
        .update('password')
        .digest('hex');

      // when
      const result = sha256EncryptedValidator.validate(hashedString);

      // then
      expect(result).toBe(true);
    });

    it('SHA-256으로 인코딩된 문자열이 아니면 false를 반환', () => {
      // given
      const strListToTest = ['1234', 'abcd', '가나다라', '1234abcd', '', null];

      strListToTest.forEach((invalidString) => {
        // when
        const result = sha256EncryptedValidator.validate(invalidString);

        // then
        expect(result).toBe(false);
      });
    });
  });
  describe('defaultMessage', () => {
    it('기본 메시지를 반환', () => {
      // given
      // when
      const result = sha256EncryptedValidator.defaultMessage();

      // then
      expect(result).toBe(ErrorMessage.NOT_SHA256_ENCRYPTED);
    });
  });
});
