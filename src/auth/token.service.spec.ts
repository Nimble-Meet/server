import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { createJwtOptions } from './auth.config';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: createJwtOptions,
          inject: [ConfigService],
        }),
      ],
      providers: [JwtService, ConfigService],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    tokenService = new TokenService(jwtService, configService);
  });

  describe('generateAccessToken, verifyAccessToken', () => {
    it('access token의 발급과 검증이 정상적', () => {
      const userId = 1;
      const accessToken = tokenService.generateAccessToken(userId);
      expect(typeof accessToken).toBe('string');
      expect(accessToken).not.toBe('');

      let jwtPayload: JwtPayloadDto;
      expect(() => {
        jwtPayload = tokenService.verifyAccessToken(accessToken);
      }).not.toThrow();
      expect(jwtPayload.userId).toEqual(userId);
    });
  });

  describe('generateRefreshToken', () => {
    it('refresh token의 발급과 검증이 정상적', async () => {
      const userId = 1;
      const refreshToken = tokenService.generateRefreshToken(userId);
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken).not.toBe('');

      let jwtPayload: JwtPayloadDto;
      expect(() => {
        jwtPayload = tokenService.verifyRefreshToken(refreshToken);
      }).not.toThrow();
      expect(jwtPayload.userId).toEqual(userId);
    });
  });
});
