import { JWT_TOKEN } from './../test/dummies/jwt-token.dummy';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';

import { User } from 'src/user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { createJwtOptions } from './auth.config';
import { UserPayloadDto } from './dto/user-payload.dto';
import { JwtToken } from './entity/jwt-token.entity';
import { UserRepositoryStub } from 'src/test/stub/user.repository.stub';
import {
  EMAIL,
  ENCRYPTED_PASSWORD,
  NICKNAME,
  PASSWORD,
  USER_ID,
} from 'src/test/dummies/user.dummy';
import { JwtTokenRepositoryStub } from 'src/test/stub/jwt-token.repository.stub';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  TOKEN_ID,
} from 'src/test/dummies/jwt-token.dummy';
import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';

describe('AuthService', () => {
  let tokenService: TokenService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: createJwtOptions,
          inject: [ConfigService],
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [JwtService, ConfigService],
    }).compile();

    const jwtService = moduleRef.get<JwtService>(JwtService);
    const configService = moduleRef.get<ConfigService>(ConfigService);

    tokenService = new TokenService(jwtService, configService);
  });

  describe('signup', () => {
    const userList = Object.freeze([
      User.create({
        id: USER_ID,
        email: EMAIL,
        nickname: NICKNAME,
        password: ENCRYPTED_PASSWORD.getPassword(),
      }),
    ]);
    const jwtTokenList = Object.freeze([
      JwtToken.create({
        id: TOKEN_ID,
        userId: USER_ID,
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      }),
    ]);

    it('새로운 유저 생성, 비밀번호는 암호화', async () => {
      // given
      const authService = new AuthService(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const localSignupDto = {
        email: 'new-email@test.com',
        nickname: NICKNAME,
        password: PASSWORD,
      };

      // when
      const user = await authService.signup(localSignupDto);

      // then
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe('new-email@test.com');
      expect(user.nickname).toBe(NICKNAME);
      expect(user.password).not.toBe(PASSWORD);
    });

    it('이미 존재하는 이메일로 가입하려고 하면 에러', async () => {
      // given
      const authService = new AuthService(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const localSignupDto = {
        email: EMAIL,
        nickname: NICKNAME,
        password: PASSWORD,
      };

      // when
      // then
      await expect(async () => {
        await authService.signup(localSignupDto);
      }).rejects.toThrow(UnauthorizedException);
    });

    // TODO: 닉네임이 중복될 경우 에러
  });

  describe('validateLocalUser', () => {
    const RESULT_USER = Object.freeze(
      User.create({
        id: USER_ID,
        email: EMAIL,
        nickname: NICKNAME,
        password: ENCRYPTED_PASSWORD.getPassword(),
      }),
    );
    const userList = Object.freeze([RESULT_USER]);
    const jwtTokenList = Object.freeze([
      JwtToken.create({
        id: TOKEN_ID,
        userId: USER_ID,
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      }),
    ]);

    it('이메일과 비밀번호가 맞다면 user를 반환', async () => {
      // given
      const authService = new AuthService(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const email = EMAIL;
      const password = PASSWORD;

      // when
      const user = await authService.validateLocalUser(email, password);

      // then
      expect(user).toEqual(RESULT_USER);
    });

    it('이메일 비밀번호가 맞지 않다면 null 반환', async () => {
      // given
      const authService = new AuthService(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const email = EMAIL;
      const password = 'invalid password';

      // when
      const result = await authService.validateLocalUser(email, password);

      // then
      expect(result).toBeNull();
    });
  });

  describe('jwtSign', () => {
    const userList = Object.freeze([
      User.create({
        id: USER_ID,
        email: EMAIL,
        nickname: NICKNAME,
        password: ENCRYPTED_PASSWORD.getPassword(),
      }),
    ]);
    const JWT_TOKEN = Object.freeze(
      JwtToken.create({
        id: TOKEN_ID,
        userId: USER_ID,
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      }),
    );
    const jwtTokenList = Object.freeze([JWT_TOKEN]);

    it('이미 로그인했던 user가 다시 요청한 경우, 기존의 JwtToken 데이터를 수정한다.', async () => {
      // given
      const authService = new AuthService(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const userId = USER_ID;
      const email = EMAIL;
      const nickname = NICKNAME;

      const userPayload = new UserPayloadDto(userId, email, nickname);

      // when
      const jwtToken = await authService.jwtSign(userPayload);

      // then
      expect(jwtToken).toBeInstanceOf(JwtToken);
      expect(jwtToken.id).toBe(TOKEN_ID);
      expect(jwtToken.accessToken).not.toBe(ACCESS_TOKEN);
      expect(jwtToken.refreshToken).not.toBe(REFRESH_TOKEN);
      expect(jwtToken.expiresAt.getTime()).toBeGreaterThan(
        new Date().getTime(),
      );

      const jwtPayloadByAT = tokenService.verifyAccessToken(
        jwtToken.accessToken,
      );
      expect(jwtPayloadByAT.userId).toBe(USER_ID);

      const jwtPayloadByRT = tokenService.verifyRefreshToken(
        jwtToken.refreshToken,
      );
      expect(jwtPayloadByRT.userId).toBe(USER_ID);
    });

    it('user가 처음으로 로그인 요청한 경우, 새롭게 JwtToken 데이터를 생성한다.', async () => {
      // given
      const authService = new AuthService(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );
      const userId = 9999;
      const email = EMAIL;
      const nickname = NICKNAME;

      const userPayload = new UserPayloadDto(userId, email, nickname);

      // when
      const jwtToken = await authService.jwtSign(userPayload);

      // then
      expect(jwtToken).toBeInstanceOf(JwtToken);
      expect(jwtToken.id).not.toBe(TOKEN_ID);
      expect(jwtToken.accessToken).not.toBe(ACCESS_TOKEN);
      expect(jwtToken.refreshToken).not.toBe(REFRESH_TOKEN);
      expect(jwtToken.expiresAt.getTime()).toBeGreaterThan(
        new Date().getTime(),
      );

      const jwtPayloadByAT = tokenService.verifyAccessToken(
        jwtToken.accessToken,
      );
      expect(jwtPayloadByAT.userId).toBe(9999);

      const jwtPayloadByRT = tokenService.verifyRefreshToken(
        jwtToken.refreshToken,
      );
      expect(jwtPayloadByRT.userId).toBe(9999);
    });
  });

  describe('rotateRefreshToken', () => {
    const userList = Object.freeze([
      User.create({
        id: USER_ID,
        email: EMAIL,
        nickname: NICKNAME,
        password: ENCRYPTED_PASSWORD.getPassword(),
      }),
    ]);

    it('적절한 accessToken과 refreshToken을 사용한 경우 새로운 토큰을 담은 JwtToken 객체 반환', async () => {
      // given
      const ACCESS_TOKEN = tokenService.generateAccessToken(USER_ID);
      const REFRESH_TOKEN = tokenService.generateRefreshToken(USER_ID);

      const jwtTokenList = Object.freeze([
        JwtToken.create({
          id: TOKEN_ID,
          userId: USER_ID,
          accessToken: ACCESS_TOKEN,
          refreshToken: REFRESH_TOKEN,
        }),
      ]);
      const authService = new AuthService(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const refreshToken = REFRESH_TOKEN;
      const accessToken = ACCESS_TOKEN;

      jest.useFakeTimers();

      // 딜레이 없이 토큰을 재발급할 경우 이전과 동일한 토큰을 발급하기 때문에, 딜레이를 두고 메서드 호출.
      setTimeout(async () => {
        // when
        const jwtToken = await authService.rotateRefreshToken(
          refreshToken,
          accessToken,
        );

        // then
        expect(jwtToken).toBeInstanceOf(JwtToken);
        expect(jwtToken.id).toBe(TOKEN_ID);
        expect(jwtToken.accessToken).not.toBe(ACCESS_TOKEN);
        expect(jwtToken.refreshToken).not.toBe(REFRESH_TOKEN);
        expect(jwtToken.expiresAt.getTime()).toBeGreaterThan(
          new Date().getTime(),
        );
      }, 1000);

      jest.runAllTimers();
    });

    it('accessToken이 JwtToken에 저장된 refreshToken과 매칭되는 데이터와 일치하지 않는 경우 에러', async () => {
      // given
      const ACCESS_TOKEN = tokenService.generateAccessToken(USER_ID);
      const REFRESH_TOKEN = tokenService.generateRefreshToken(USER_ID);

      const jwtTokenList = Object.freeze([
        JwtToken.create({
          id: TOKEN_ID,
          userId: USER_ID,
          accessToken: ACCESS_TOKEN,
          refreshToken: REFRESH_TOKEN,
        }),
      ]);
      const authService = new AuthService(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const refreshToken = REFRESH_TOKEN;
      const accessToken = 'invalid_access_token';

      // when
      // then
      await expect(async () => {
        await authService.rotateRefreshToken(refreshToken, accessToken);
      }).rejects.toThrow(UnauthorizedException);
    });

    it('accessToken이 JwtToken에 저장된 refreshToken과 매칭되는 데이터와 일치하지 않는 경우 에러', async () => {
      // given
      const ACCESS_TOKEN = tokenService.generateAccessToken(USER_ID);
      const EXPIRED_REFRESH_TOKEN = 'expired_refresh_token';

      const jwtTokenList = Object.freeze([
        JwtToken.create({
          id: TOKEN_ID,
          userId: USER_ID,
          accessToken: ACCESS_TOKEN,
          refreshToken: EXPIRED_REFRESH_TOKEN,
        }),
      ]);
      const authService = new AuthService(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const refreshToken = EXPIRED_REFRESH_TOKEN;
      const accessToken = ACCESS_TOKEN;

      // when
      // then
      await expect(async () => {
        await authService.rotateRefreshToken(refreshToken, accessToken);
      }).rejects.toThrow(
        new UnauthorizedException('리프레시 토큰이 만료되었습니다.'),
      );
    });
  });
});
