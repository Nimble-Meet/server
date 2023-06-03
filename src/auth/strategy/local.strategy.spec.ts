import { LocalStrategy } from './local.strategy';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { IAuthService } from '../auth.service.interface';
import { AuthServiceStub } from '../../test/stub/auth.service.stub';
import {
  createOauthUser,
  createUser,
  EMAIL,
  ENCRYPTED_PASSWORD,
  NICKNAME,
  PASSWORD,
  USER_ID,
} from '../../test/dummies/user.dummy';
import { UserPayloadDto } from '../dto/user-payload.dto';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';
import { UnauthorizedException } from '@nestjs/common';
import { AuthErrorMessage } from '../auth.error-message';
import { createJwtToken } from '../../test/dummies/jwt-token.dummy';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  const user = createUser({});
  const jwtToken = createJwtToken({});

  const getTestingModuleWith = (authServiceStub: AuthServiceStub) =>
    Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        {
          provide: IAuthService,
          useValue: authServiceStub,
        },
        LocalStrategy,
      ],
    }).compile();

  beforeEach(async () => {
    const module = await getTestingModuleWith(
      new AuthServiceStub(user, jwtToken),
    );
    localStrategy = module.get(LocalStrategy);
  });

  describe('validate', () => {
    it('유효한 이메일과 비밀번호로 검증 요청 시 해당 유저의 정보 반환', async () => {
      // given
      const email = EMAIL;
      const password = ENCRYPTED_PASSWORD.getPassword();

      // when
      const result = await localStrategy.validate(email, password);

      // then
      expect(result).toEqual(
        UserPayloadDto.create({
          id: USER_ID,
          email: EMAIL,
          nickname: NICKNAME,
          providerType: OauthProvider.LOCAL,
        }),
      );
    });

    it('존재하지 않는 이메일이면 UnauthorizedException 발생', async () => {
      // given
      const email = 'not_exist@email.com';
      const password = 'not_exist_password';

      // when
      // then
      await expect(localStrategy.validate(email, password)).rejects.toThrow(
        new UnauthorizedException(AuthErrorMessage.LOGIN_FAILED),
      );
    });

    it('잘못된 비밀번호이면 UnauthorizedException 발생', async () => {
      // given
      const email = EMAIL;
      const password = 'invalid_password';

      // when
      // then
      await expect(localStrategy.validate(email, password)).rejects.toThrow(
        new UnauthorizedException(AuthErrorMessage.LOGIN_FAILED),
      );
    });

    it('oauth 방식으로 가입했던 유저이면 UnauthorizedException 발생', async () => {
      const oauthUser = createOauthUser({
        providerType: OauthProvider.GOOGLE,
      });
      const module = await getTestingModuleWith(
        new AuthServiceStub(oauthUser, jwtToken),
      );
      localStrategy = module.get(LocalStrategy);

      // given
      const email = EMAIL;
      const password = PASSWORD;

      // when
      // then
      await expect(localStrategy.validate(email, password)).rejects.toThrow(
        new UnauthorizedException(
          AuthErrorMessage.OAUTH_PROVIDER_UNMATCHED[OauthProvider.GOOGLE],
        ),
      );
    });
  });
});
