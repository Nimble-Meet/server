import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { IAuthService } from './auth.service.interface';
import { AuthServiceStub } from '../test/stub/auth.service.stub';
import { AuthController } from './auth.controller';
import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import * as crypto from 'crypto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { OauthProvider } from '../common/enums/oauth-provider.enum';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AuthErrorMessage } from './auth.error-message';
import { Request } from 'express';
import {
  imock,
  instance,
  MockPropertyPolicy,
  when,
} from '@johanblumenberg/ts-mockito';
import {
  createUser,
  EMAIL,
  NICKNAME,
  USER_ID,
} from '../test/dummies/user.dummy';
import {
  ACCESS_TOKEN,
  createJwtToken,
  REFRESH_TOKEN,
} from '../test/dummies/jwt-token.dummy';
import { createUserPayloadDto } from '../test/dummies/user-payload.dummy';

describe('AuthController', () => {
  const getTestingModule = (userService: IAuthService) =>
    Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        {
          provide: IAuthService,
          useValue: userService,
        },
        AuthController,
      ],
    }).compile();

  const encryptPassword = (password: string) =>
    crypto.createHash('sha256').update(password).digest('base64');

  describe('signup', () => {
    const existingUser = createUser({
      email: 'existing@email.com',
      nickname: 'existing_user',
    });

    let authController: AuthController;
    beforeEach(async () => {
      const module = await getTestingModule(
        new AuthServiceStub(existingUser, null),
      );
      authController = module.get<AuthController>(AuthController);
    });

    it('적절한 회원가입 정보로 요청하면 새로운 유저를 생성하여 일부의 유저 정보를 반환한다.', async () => {
      // given
      const localSignupRequestDto = LocalSignupRequestDto.create({
        email: 'user@email.com',
        password: encryptPassword('password'),
        nickname: 'nickname',
      });

      // when
      const userResponseDto = await authController.signup(
        localSignupRequestDto,
      );

      // then
      expect(
        userResponseDto.equals(
          UserResponseDto.create({
            email: 'user@email.com',
            nickname: 'nickname',
            providerType: OauthProvider.LOCAL,
          }),
        ),
      ).toBe(true);
    });

    it('이미 존재하는 이메일로 회원가입을 요청하면 ConflictException 반환', async () => {
      // given
      const localSignupRequestDto = LocalSignupRequestDto.create({
        email: 'existing@email.com',
        password: encryptPassword('password'),
        nickname: 'nickname',
      });

      // when
      // then
      await expect(
        authController.signup(localSignupRequestDto),
      ).rejects.toThrow(
        new ConflictException(AuthErrorMessage.EMAIL_ALREADY_EXISTS),
      );
    });

    it('이미 존재하는 닉네임으로 회원가입을 요청하면 ConflictException 반환', async () => {
      // given
      const localSignupRequestDto = LocalSignupRequestDto.create({
        email: 'user@email.com',
        password: encryptPassword('password'),
        nickname: 'existing_user',
      });

      // when
      // then
      await expect(
        authController.signup(localSignupRequestDto),
      ).rejects.toThrow(
        new ConflictException(AuthErrorMessage.NICKNAME_ALREADY_EXISTS),
      );
    });
  });

  describe('login', () => {
    const user = createUser({});
    let authController: AuthController;
    beforeEach(async () => {
      const module = await getTestingModule(new AuthServiceStub(user, null));
      authController = module.get<AuthController>(AuthController);
    });

    it('user payload로 로그인하면 jwt token 관련 정보를 반환', async () => {
      // given
      const userPayloadDto = createUserPayloadDto();

      // when
      const jwtSignResultDto = await authController.login(userPayloadDto);

      // then
      expect(jwtSignResultDto.userId).toEqual(USER_ID);
      expect(jwtSignResultDto.accessToken).not.toBeNull();
      expect(jwtSignResultDto.refreshToken).not.toBeNull();
    });
  });

  describe('refreshToken', () => {
    let authController: AuthController;
    const jwtToken = createJwtToken({});
    beforeEach(async () => {
      const module = await getTestingModule(
        new AuthServiceStub(null, jwtToken),
      );
      authController = module.get<AuthController>(AuthController);
    });

    it('유효한 token을 담은 Request로 토큰 재발급을 요청하면 재발급된 토큰 정보를 반환', async () => {
      // given
      const MockRequest: Request = imock(MockPropertyPolicy.StubAsProperty);
      when(MockRequest.cookies).thenReturn({ refresh_token: REFRESH_TOKEN });
      when(MockRequest.headers).thenReturn({
        authorization: `Bearer ${ACCESS_TOKEN}`,
      });
      const request = instance(MockRequest);

      // when
      const jwtSignResultDto = await authController.refreshToken(request);

      // then
      expect(jwtSignResultDto.userId).toEqual(USER_ID);
      expect(jwtSignResultDto.accessToken).not.toBeNull();
      expect(jwtSignResultDto.refreshToken).not.toBeNull();
    });

    it('쿠키에 refresh token이 누락되어 있으면 BadRequestException 반환', async () => {
      // given
      const MockRequest: Request = imock(MockPropertyPolicy.StubAsProperty);
      when(MockRequest.cookies).thenReturn({});
      when(MockRequest.headers).thenReturn({
        authorization: `Bearer ${ACCESS_TOKEN}`,
      });
      const request = instance(MockRequest);

      // when
      // then
      await expect(authController.refreshToken(request)).rejects.toThrow(
        new BadRequestException(AuthErrorMessage.REFRESH_TOKEN_DOES_NOT_EXIST),
      );
    });

    it('쿠키에 access token이 누락되어 있으면 BadRequestException 반환', async () => {
      // given
      const MockRequest: Request = imock(MockPropertyPolicy.StubAsProperty);
      when(MockRequest.cookies).thenReturn({ refresh_token: REFRESH_TOKEN });
      when(MockRequest.headers).thenReturn({});
      const request = instance(MockRequest);

      // when
      // then
      await expect(authController.refreshToken(request)).rejects.toThrow(
        new BadRequestException(AuthErrorMessage.ACCESS_TOKEN_DOES_NOT_EXIST),
      );
    });
  });

  describe('whoami', () => {
    let authController: AuthController;
    beforeEach(async () => {
      const module = await getTestingModule(new AuthServiceStub(null, null));
      authController = module.get<AuthController>(AuthController);
    });

    it('user paylod로 본인 확인을 요청하면 유저 정보를 반환', async () => {
      // given
      const userPayloadDto = createUserPayloadDto({});

      // when
      const userResponseDto = await authController.whoami(userPayloadDto);

      // then
      expect(
        userResponseDto.equals(
          UserResponseDto.create({
            email: EMAIL,
            nickname: NICKNAME,
            providerType: OauthProvider.LOCAL,
          }),
        ),
      ).toBe(true);
    });
  });
});
