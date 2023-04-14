import { JwtToken } from './jwt-token.entity';

describe('JwtToken entity', () => {
  describe('equalsAccessToken', () => {
    it('should return true if the access token matches', () => {
      // given
      const accessToken = 'test-access-token';
      // when
      const jwtToken = JwtToken.create({
        accessToken,
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(),
      });
      // then
      expect(jwtToken.equalsAccessToken(accessToken)).toBe(true);
    });

    it('should return false if the access token does not match', () => {
      // given
      const accessToken = 'test-access-token';
      // when
      const jwtToken = JwtToken.create({
        accessToken,
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(),
      });
      // then
      expect(jwtToken.equalsAccessToken('invalid-access-token')).toBe(false);
    });
  });
});
