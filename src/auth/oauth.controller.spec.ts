import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { IAuthService } from './auth.service.interface';
import { AuthServiceStub } from '../test/stub/auth.service.stub';
import { AuthController } from './auth.controller';
import { OauthProvider } from '../common/enums/oauth-provider.enum';
import { UnauthorizedException } from '@nestjs/common';
import { AuthErrorMessage } from './auth.error-message';
import {
  createOauthUser,
  EMAIL,
  NICKNAME,
  PROVIDER_ID,
  USER_ID,
} from '../test/dummies/user.dummy';
import { createJwtToken } from '../test/dummies/jwt-token.dummy';
import { OauthPayloadDto } from './dto/oauth-payload.dto';
import { OauthController } from './oauth.controller';

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
        OauthController,
      ],
    }).compile();

  describe('googleLoginCallback', () => {
    let oauthController: OauthController;
    const user = createOauthUser({ providerType: OauthProvider.GOOGLE });
    const jwtToken = createJwtToken({});
    beforeEach(async () => {
      const module = await getTestingModule(
        new AuthServiceStub(user, jwtToken),
      );
      oauthController = module.get<OauthController>(OauthController);
    });

    it('기존에 가입한 유저인 경우 해당 유저 객체를 반환', async () => {
      // given
      const oauthPayload = OauthPayloadDto.create({
        email: EMAIL,
        nickname: NICKNAME,
        providerType: OauthProvider.GOOGLE,
        providerId: PROVIDER_ID,
      });

      // when
      const jwtSignResultDto = await oauthController.googleLoginCallback(
        oauthPayload,
      );

      // then
      expect(jwtSignResultDto.userId).toBe(USER_ID);
      expect(jwtSignResultDto.accessToken).toBeTruthy();
      expect(jwtSignResultDto.refreshToken).toBeTruthy();
    });

    it('신규 사용자인 경우 새로운 유저를 생성하여 일부 정보를 반환', async () => {
      // given
      const oauthPayload = OauthPayloadDto.create({
        email: 'new@email.com',
        nickname: 'new_nickname',
        providerType: OauthProvider.GOOGLE,
        providerId: 'new_oauth123',
      });

      // when
      const jwtSignResultDto = await oauthController.googleLoginCallback(
        oauthPayload,
      );

      // then
      expect(jwtSignResultDto.userId).toBeTruthy();
      expect(jwtSignResultDto.accessToken).toBeTruthy();
      expect(jwtSignResultDto.refreshToken).toBeTruthy();
    });

    it('다른 로그인 방식으로 가입한 유저이면 UnauthorizedException 발생', async () => {
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
        oauthController.googleLoginCallback(oauthPayload),
      ).rejects.toThrow(
        new UnauthorizedException(
          AuthErrorMessage.OAUTH_PROVIDER_UNMATCHED[oauthPayload.providerType],
        ),
      );
    });
  });
});
