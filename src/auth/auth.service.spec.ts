import { Test } from '@nestjs/testing';
import { AuthServiceImpl } from './auth.service';

import { User } from 'src/user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { createJwtOptions } from './auth.config';
import { JwtToken } from './entity/jwt-token.entity';
import { UserRepositoryStub } from 'src/test/stub/user.repository.stub';
import {
  createOauthUser,
  createUser,
  EMAIL,
  NICKNAME,
  PROVIDER_ID,
  PASSWORD,
  USER_ID,
} from 'src/test/dummies/user.dummy';
import { JwtTokenRepositoryStub } from 'src/test/stub/jwt-token.repository.stub';
import {
  ACCESS_TOKEN,
  createJwtToken,
  REFRESH_TOKEN,
  TOKEN_ID,
} from 'src/test/dummies/jwt-token.dummy';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { OauthProvider } from 'src/common/enums/oauth-provider.enum';
import { IJwtTokenRepository } from './repository/jwt-token.repository.interface';
import { IAuthService } from './auth.service.interface';
import { IUserRepository } from 'src/user/repository/user.repository.interface';
import { AuthErrorMessage } from './auth.error-message';
import { OauthPayloadDto } from './dto/oauth-payload.dto';

describe('AuthService', () => {
  const getTestingModule = (
    userRepository: IUserRepository,
    jwtTokenRepository: IJwtTokenRepository,
  ) =>
    Test.createTestingModule({
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
      providers: [
        {
          provide: IUserRepository,
          useValue: userRepository,
        },
        {
          provide: IJwtTokenRepository,
          useValue: jwtTokenRepository,
        },
        {
          provide: IAuthService,
          useClass: AuthServiceImpl,
        },
        JwtService,
        ConfigService,
        TokenService,
      ],
    }).compile();

  describe('signup', () => {
    const userList = Object.freeze([createUser({})]);
    const jwtTokenList = Object.freeze([createJwtToken({})]);

    let authService: IAuthService;

    beforeEach(async () => {
      const module = await getTestingModule(
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );
      authService = module.get<IAuthService>(IAuthService);
    });

    it('적절한 데이터로 회원가입을 요청하면 새로운 사용자를 생성하여 반환 (비밀번호는 암호화)', async () => {
      // given
      const localSignupDto = {
        email: 'new-email@test.com',
        nickname: 'new-nickname',
        password: PASSWORD,
      };

      // when
      const user = await authService.signup(localSignupDto);

      // then
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe('new-email@test.com');
      expect(user.nickname).toBe('new-nickname');
      expect(user.password).not.toBe(PASSWORD);
    });

    it('이미 존재하는 이메일이면 ConflictException 발생', async () => {
      // given
      const localSignupDto = {
        email: EMAIL,
        nickname: 'new-nickname',
        password: PASSWORD,
      };

      // when
      // then
      await expect(authService.signup(localSignupDto)).rejects.toThrow(
        new ConflictException(AuthErrorMessage.EMAIL_ALREADY_EXISTS),
      );
    });
  });

  describe('validateLocalUser', () => {
    const userList = Object.freeze([createUser({})]);
    const jwtTokenList = Object.freeze([createJwtToken({})]);

    let authService: IAuthService;

    beforeEach(async () => {
      const module = await getTestingModule(
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );
      authService = module.get<IAuthService>(IAuthService);
    });

    it('유효한 이메일과 비밀번호로 사용자 인증을 요청하면 해당 사용자를 반환', async () => {
      // given
      const email = EMAIL;
      const password = PASSWORD;

      // when
      const user = await authService.validateLocalUser(email, password);

      // then
      expect(user).toEqual(createUser({}));
    });

    it('존재하지 않는 이메일이면 UnauthorizedException 발생', async () => {
      // given
      const email = 'invalid@email.com';
      const password = 'invalid password';

      // when
      // then
      await expect(
        authService.validateLocalUser(email, password),
      ).rejects.toThrow(
        new UnauthorizedException(AuthErrorMessage.LOGIN_FAILED),
      );
    });

    it('비밀번호가 맞지 않으면 UnauthorizedException 발생', async () => {
      // given
      const email = EMAIL;
      const password = 'invalid password';

      // when
      // then
      await expect(
        authService.validateLocalUser(email, password),
      ).rejects.toThrow(
        new UnauthorizedException(AuthErrorMessage.LOGIN_FAILED),
      );
    });

    it('oauth provider type이 맞지 않으면 UnauthorizedException 발생', async () => {
      const userList = Object.freeze([
        createOauthUser({
          providerType: OauthProvider.GOOGLE,
        }),
      ]);
      const module = await getTestingModule(
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );
      authService = module.get<IAuthService>(IAuthService);

      // given
      const email = EMAIL;
      const password = 'invalid password';

      // when
      // then
      await expect(
        authService.validateLocalUser(email, password),
      ).rejects.toThrow(
        new UnauthorizedException(
          AuthErrorMessage.OAUTH_PROVIDER_UNMATCHED[OauthProvider.GOOGLE],
        ),
      );
    });
  });

  describe('validateOrSignupOauthUser', () => {
    const userList = Object.freeze([
      createOauthUser({
        providerType: OauthProvider.GOOGLE,
      }),
    ]);
    const jwtTokenList = Object.freeze([createJwtToken({})]);

    let authService: IAuthService;

    beforeEach(async () => {
      const module = await getTestingModule(
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );
      authService = module.get<IAuthService>(IAuthService);
    });

    it('이미 존재하는 사용자이고 oauth provider type이 적절하다면 해당 유저를 반환', async () => {
      // given
      const oauthPayload = OauthPayloadDto.create({
        email: EMAIL,
        nickname: NICKNAME,
        providerType: OauthProvider.GOOGLE,
        providerId: PROVIDER_ID,
      });

      // when
      const user = await authService.validateOrSignupOauthUser(oauthPayload);

      // then
      expect(user).toEqual(
        createOauthUser({
          providerType: OauthProvider.GOOGLE,
        }),
      );
    });

    it('새로 가입하는 사용자이면 새로운 유저를 생성하여 반환', async () => {
      // given
      const oauthPayload = OauthPayloadDto.create({
        email: 'new@email.com',
        nickname: 'new-nickname',
        providerType: OauthProvider.GOOGLE,
        providerId: 'new-oauth1234',
      });

      // when
      const user = await authService.validateOrSignupOauthUser(oauthPayload);

      // then
      expect(user).toEqual(
        User.create({
          email: 'new@email.com',
          nickname: 'new-nickname',
          providerType: OauthProvider.GOOGLE,
          providerId: 'new-oauth1234',
        }),
      );
    });

    it('이미 존재하는 사용자일 때 oauth provider type이 다르다면 UnauthorizedException 발생', async () => {
      // given
      const oauthPayload = OauthPayloadDto.create({
        email: EMAIL,
        nickname: NICKNAME,
        providerType: OauthProvider.LOCAL,
        providerId: PROVIDER_ID,
      });

      // when
      // then
      await expect(
        authService.validateOrSignupOauthUser(oauthPayload),
      ).rejects.toThrow(
        new UnauthorizedException(
          AuthErrorMessage.OAUTH_PROVIDER_UNMATCHED[OauthProvider.GOOGLE],
        ),
      );
    });

    it('이미 존재하는 사용자일 때 provider id가 다르다면 UnauthorizedException 발생', async () => {
      // given
      const oauthPayload = OauthPayloadDto.create({
        email: EMAIL,
        nickname: NICKNAME,
        providerType: OauthProvider.GOOGLE,
        providerId: 'unmatched-provider-id',
      });

      // when
      // then
      await expect(
        authService.validateOrSignupOauthUser(oauthPayload),
      ).rejects.toThrow(
        new UnauthorizedException(AuthErrorMessage.OAUTH_PROVIDER_ID_UNMATCHED),
      );
    });
  });

  describe('jwtSign', () => {
    const userList = Object.freeze([createUser({})]);
    const JWT_TOKEN = Object.freeze(createJwtToken({}));
    const jwtTokenList = Object.freeze([JWT_TOKEN]);

    let authService: IAuthService;
    let tokenService: TokenService;

    beforeEach(async () => {
      const module = await getTestingModule(
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );
      authService = module.get<IAuthService>(IAuthService);
      tokenService = module.get<TokenService>(TokenService);
    });

    it('이미 로그인했던 user가 토큰 발급을 요청하면 기존의 JwtToken 데이터를 수정', async () => {
      // given
      const userId = USER_ID;
      const email = EMAIL;
      const nickname = NICKNAME;
      const providerType = OauthProvider.LOCAL;

      const user = User.create({
        id: userId,
        email,
        nickname,
        providerType,
      });

      // when
      const jwtToken = await authService.jwtSign(user);

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

    it('새로운 사용자가 토큰 발급을 요청하면 새롭게 JwtToken 데이터를 생성', async () => {
      // given
      const userId = 9999;
      const email = EMAIL;
      const nickname = NICKNAME;
      const providerType = OauthProvider.LOCAL;

      const user = User.create({
        id: userId,
        email,
        nickname,
        providerType,
      });

      // when
      const jwtToken = await authService.jwtSign(user);

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
    const userList = Object.freeze([createUser({})]);

    let tokenService: TokenService;
    let configService: ConfigService;
    beforeAll(async () => {
      // tokenService, configService를 생성하기 위한 테스트 모듈
      const module = await Test.createTestingModule({
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

      tokenService = module.get<TokenService>(TokenService);
      configService = module.get<ConfigService>(ConfigService);
    });

    it('유효한 accessToken과 refreshToken을 사용하여 토큰 갱신을 요청하면, 새로운 토큰을 담은 JwtToken 객체 반환', async () => {
      // given
      const prevAccessToken = tokenService.generateAccessToken(USER_ID);
      const prevRefreshToken = tokenService.generateRefreshToken(USER_ID);

      const jwtTokenList = Object.freeze([
        createJwtToken({
          accessToken: prevAccessToken,
          refreshToken: prevRefreshToken,
        }),
      ]);
      const authService = new AuthServiceImpl(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const refreshToken = prevRefreshToken;
      const accessToken = prevAccessToken;

      // 딜레이 없이 토큰을 재발급할 경우 이전과 동일한 토큰을 발급하기 때문에, 딜레이를 두고 메서드 호출.
      const mockDateNow = jest
        .spyOn(Date, 'now')
        .mockImplementation(() =>
          new Date(new Date().getTime() + 1000).valueOf(),
        );

      // when
      const jwtToken = await authService.rotateRefreshToken(
        refreshToken,
        accessToken,
      );

      // then
      expect(jwtToken).toBeInstanceOf(JwtToken);
      expect(jwtToken.id).toBe(TOKEN_ID);
      expect(jwtToken.accessToken).not.toBe(prevAccessToken);
      expect(jwtToken.refreshToken).not.toBe(prevRefreshToken);
      expect(jwtToken.expiresAt.getTime()).toBeGreaterThan(
        new Date().getTime(),
      );

      mockDateNow.mockRestore();
    });

    it('발급한 적이 없는 refreshToken 이면 UnauthorizedException 발생', async () => {
      // given
      const prevAccessToken = tokenService.generateAccessToken(USER_ID);
      const prevRefreshToken = tokenService.generateRefreshToken(USER_ID);

      const jwtTokenList = Object.freeze([
        createJwtToken({
          accessToken: prevAccessToken,
          refreshToken: prevRefreshToken,
        }),
      ]);
      const authService = new AuthServiceImpl(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const refreshToken = 'invalidRefreshToken';
      const accessToken = prevAccessToken;

      // when
      // then
      await expect(
        authService.rotateRefreshToken(refreshToken, accessToken),
      ).rejects.toThrow(
        new UnauthorizedException(AuthErrorMessage.INVALID_REFRESH_TOKEN),
      );
    });

    it('accessToken 이 refreshToken 과 매칭되지 않으면 UnauthorizedException 발생', async () => {
      // given
      const prevAccessToken = tokenService.generateAccessToken(USER_ID);
      const prevRefreshToken = tokenService.generateRefreshToken(USER_ID);

      const jwtTokenList = Object.freeze([
        createJwtToken({
          accessToken: prevAccessToken,
          refreshToken: prevRefreshToken,
        }),
      ]);
      const authService = new AuthServiceImpl(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const refreshToken = prevRefreshToken;
      const accessToken = 'invalid_access_token';

      // when
      // then
      await expect(
        authService.rotateRefreshToken(refreshToken, accessToken),
      ).rejects.toThrow(
        new UnauthorizedException(AuthErrorMessage.INCONSISTENT_ACCESS_TOKEN),
      );
    });

    it('refresh token 이 만료되었다면 UnauthorizedException 발생', async () => {
      // given
      const prevAccessToken = tokenService.generateAccessToken(USER_ID);
      const expiredRefreshToken = tokenService.generateRefreshToken(USER_ID);

      const jwtTokenList = Object.freeze([
        createJwtToken({
          accessToken: prevAccessToken,
          refreshToken: expiredRefreshToken,
        }),
      ]);
      const authService = new AuthServiceImpl(
        tokenService,
        new UserRepositoryStub(userList),
        new JwtTokenRepositoryStub(jwtTokenList),
      );

      const refreshToken = expiredRefreshToken;
      const accessToken = prevAccessToken;

      // when
      // then
      // 만료 시간이 지난 시점으로 설정
      const mockDateNow = jest
        .spyOn(Date, 'now')
        .mockImplementation(() =>
          new Date(
            new Date().getTime() +
              configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
          ).valueOf(),
        );

      await expect(
        authService.rotateRefreshToken(refreshToken, accessToken),
      ).rejects.toThrow(
        new UnauthorizedException(AuthErrorMessage.EXPIRED_REFRESH_TOKEN),
      );

      mockDateNow.mockRestore();
    });
  });
});
