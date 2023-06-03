import * as t from 'typed-assert';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-naver';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';
import { OauthPayloadDto } from '../dto/oauth-payload.dto';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('OAUTH_NAVER_ID'),
      clientSecret: configService.get('OAUTH_NAVER_SECRET'),
      callbackURL: configService.get('OAUTH_NAVER_REDIRECT_URL'),
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return OauthPayloadDto.create({
      email: profile._json.email,
      nickname: profile._json.nickname,
      providerType: OauthProvider.NAVER,
      providerId: profile.id,
    });
  }
}
