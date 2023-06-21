import { createJwtToken } from '../../test/dummies/jwt-token.dummy';

describe('JwtToken', () => {
  describe('equalsAccessToken', () => {
    it('동일한 access token으로 호출하면 true를 반환', () => {
      // given
      const accessToken = 'valid access token';

      // when
      const jwtToken = createJwtToken({ accessToken });

      // then
      expect(jwtToken.equalsAccessToken('valid access token')).toBe(true);
    });

    it('다른 access token으로 호출하면 false를 반환', () => {
      // given
      const accessToken = 'valid access token';

      // when
      const jwtToken = createJwtToken({ accessToken });

      // then
      expect(jwtToken.equalsAccessToken('-----')).toBe(false);
    });
  });
});
