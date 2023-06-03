import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EMAIL } from '../../test/dummies/user.dummy';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';
import { GoogleStrategy } from './google.strategy';
import { Profile } from 'passport-google-oauth20';
import {
  imock,
  instance,
  MockPropertyPolicy,
  when,
} from '@johanblumenberg/ts-mockito';
import { OauthPayloadDto } from '../dto/oauth-payload.dto';

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
      ],
      providers: [GoogleStrategy],
    }).compile();
    googleStrategy = module.get(GoogleStrategy);
  });

  describe('validate', () => {
    it('유효한 형식의 정보를 담아서 호출하면 oauth 인증 정보를 반환', async () => {
      // given
      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';
      const MockProfile: Profile = imock(MockPropertyPolicy.StubAsProperty);
      when(MockProfile.name).thenReturn({
        familyName: '',
        givenName: 'username',
      });
      when(MockProfile.emails).thenReturn([
        {
          value: EMAIL,
          verified: 'true',
        },
      ]);
      when(MockProfile.id).thenReturn('user_id');
      const profile = instance(MockProfile);

      // when
      const oauthPayload = await googleStrategy.validate(
        accessToken,
        refreshToken,
        profile,
      );

      // then
      expect(oauthPayload).toEqual(
        OauthPayloadDto.create({
          email: EMAIL,
          nickname: 'username',
          providerType: OauthProvider.GOOGLE,
          providerId: 'user_id',
        }),
      );
    });
  });
});
