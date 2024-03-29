import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { createJwtOptions } from './auth.config';

describe('TokenService', () => {
  let tokenService: TokenService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        JwtModule.registerAsync({
          useFactory: createJwtOptions,
          inject: [ConfigService],
        }),
      ],
      providers: [JwtService, ConfigService, TokenService],
    }).compile();

    configService = moduleRef.get<ConfigService>(ConfigService);
    tokenService = moduleRef.get<TokenService>(TokenService);
  });

  describe('generateAccessToken', () => {
    it('userId를 이용하여 access token을 발급한다.', () => {
      // given
      const userId = 1;

      // when
      const accessToken = tokenService.generateAccessToken(userId);

      // then
      expect(typeof accessToken).toBe('string');
      expect(accessToken).not.toBe('');
    });
  });

  describe('generateRefreshToken', () => {
    it('userId를 이용하여 refresh token을 발급한다.', () => {
      // given
      const userId = 1;

      // when
      const refreshToken = tokenService.generateRefreshToken(userId);

      // then
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken).not.toBe('');
    });
  });

  describe('verifyAccessToken', () => {
    it('유효한 Access Token으로 검증하면 userId가 담긴 payload가 반환됨', () => {
      // given
      const userId = 1;
      const accessToken = tokenService.generateAccessToken(userId);

      // when
      const jwtPayload = tokenService.verifyAccessToken(accessToken);

      // then
      expect(jwtPayload.userId).toEqual(userId);
    });

    it('유효하지 않은 Access Token으로 검증하면 에러가 발생', () => {
      // given
      const accessToken = 'invalid token';

      // when
      // then
      expect(() => {
        tokenService.verifyAccessToken(accessToken);
      }).toThrow(Error);
    });

    it('만료된 Access Token으로 검증하면 에러가 발생', () => {
      // given
      const userId = 1;
      const accessToken = tokenService.generateAccessToken(userId);

      // when
      // then
      const mockDateNow = jest
        .spyOn(Date, 'now')
        .mockImplementation(() =>
          new Date(
            new Date().getTime() +
              configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') * 1000 +
              1000,
          ).valueOf(),
        );

      expect(() => {
        tokenService.verifyAccessToken(accessToken);
      }).toThrow(Error);

      mockDateNow.mockRestore();
    });
  });

  describe('verifyRefreshToken', () => {
    it('유효한 Refresh Token으로 검증하면 userId가 담긴 payload가 반환됨', () => {
      // given
      const userId = 1;
      const refreshToken = tokenService.generateRefreshToken(userId);

      // when
      const jwtPayload = tokenService.verifyRefreshToken(refreshToken);

      // then
      expect(jwtPayload.userId).toEqual(userId);
    });

    it('유효하지 않은 Refresh Token으로 검증하면 에러가 발생', () => {
      // given
      const refreshToken = 'invalid token';

      // when
      // then
      expect(() => {
        tokenService.verifyRefreshToken(refreshToken);
      }).toThrow(Error);
    });

    it('만료된 Refresh Token으로 검증하면 에러가 발생', () => {
      // given
      const userId = 1;
      const refreshToken = tokenService.generateRefreshToken(userId);

      // when
      // then
      const mockDateNow = jest
        .spyOn(Date, 'now')
        .mockImplementation(() =>
          new Date(
            new Date().getTime() +
              configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000 +
              1000,
          ).valueOf(),
        );

      expect(() => {
        tokenService.verifyRefreshToken(refreshToken);
      }).toThrow(Error);

      mockDateNow.mockRestore();
    });
  });

  describe('getRefreshTokenExpiresAt', () => {
    it('Refresh Token의 만료 시간을 반환한다.', () => {
      // given
      // when
      const refreshTokenExpiresAt = tokenService.getRefreshTokenExpiresAt();

      // then
      expect(refreshTokenExpiresAt).toBeInstanceOf(Date);
      expect(refreshTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
