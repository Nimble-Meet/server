import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EMAIL, NICKNAME } from '../../test/dummies/user.dummy';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';
import { Profile } from 'passport-naver';
import {
  imock,
  instance,
  MockPropertyPolicy,
  when,
} from '@johanblumenberg/ts-mockito';
import { OauthPayloadDto } from '../dto/oauth-payload.dto';
import { NaverStrategy } from './naver.strategy';

describe('NaverStrategy', () => {
  let naverStrategy: NaverStrategy;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
      ],
      providers: [NaverStrategy],
    }).compile();
    naverStrategy = module.get(NaverStrategy);
  });

  describe('validate', () => {
    it('유효한 형식의 정보를 담아서 호출하면 oauth 인증 정보를 반환', async () => {
      // given
      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';
      const MockProfile: Profile = imock(MockPropertyPolicy.StubAsProperty);
      when(MockProfile._json).thenReturn({
        email: EMAIL,
        nickname: NICKNAME,
        profile_image: '',
        birthday: '',
        age: 1,
        id: '',
      });
      when(MockProfile.id).thenReturn('user_id');

      const profile = instance(MockProfile);

      // when
      const oauthPayload = await naverStrategy.validate(
        accessToken,
        refreshToken,
        profile,
      );

      // then
      expect(oauthPayload).toEqual(
        OauthPayloadDto.create({
          email: EMAIL,
          nickname: NICKNAME,
          providerType: OauthProvider.NAVER,
          providerId: 'user_id',
        }),
      );
    });
  });
});
