import * as t from 'typed-assert';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';
import { OauthPayloadDto } from '../dto/oauth-payload.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('OAUTH_GOOGLE_ID'),
      clientSecret: configService.get('OAUTH_GOOGLE_SECRET'),
      callbackURL: configService.get('OAUTH_GOOGLE_REDIRECT_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    t.isNotUndefined(profile.name);
    t.isNotUndefined(profile.emails);

    return OauthPayloadDto.create({
      email: profile.emails[0].value,
      nickname: profile.name.givenName,
      providerType: OauthProvider.GOOGLE,
      providerId: profile.id,
    });
  }
}
