// implements IAuthService

import { IAuthService } from '../../auth/auth.service.interface';
import { UserPayloadDto } from '../../auth/dto/user-payload.dto';
import { JwtToken } from '../../auth/entity/jwt-token.entity';
import { LocalSignupRequestDto } from '../../auth/dto/request/local-signup-request.dto';
import { User } from '../../user/entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthErrorMessage } from '../../auth/auth.error-message';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';
import { OauthPayloadDto } from '../../auth/dto/oauth-payload.dto';

export class AuthServiceStub implements IAuthService {
  private readonly existingUser: User;
  private readonly existingJwtToken: JwtToken;

  constructor(existingUser: User, existingJwtToken: JwtToken) {
    this.existingUser = Object.freeze(existingUser);
    this.existingJwtToken = Object.freeze(existingJwtToken);
  }

  signup(localSignupDto: LocalSignupRequestDto): Promise<User> {
    if (this.existingUser.email === localSignupDto.email) {
      throw new ConflictException(AuthErrorMessage.EMAIL_ALREADY_EXISTS);
    }

    return Promise.resolve(
      User.create({
        ...localSignupDto,
        providerType: OauthProvider.LOCAL,
      }),
    );
  }

  validateLocalUser(email: string, password: string): Promise<User> {
    if (this.existingUser.email !== email) {
      throw new UnauthorizedException(AuthErrorMessage.LOGIN_FAILED);
    }
    if (this.existingUser.providerType !== OauthProvider.LOCAL) {
      throw new UnauthorizedException(
        AuthErrorMessage.OAUTH_PROVIDER_UNMATCHED[
          this.existingUser.providerType
        ],
      );
    }
    if (this.existingUser.password !== password) {
      throw new UnauthorizedException(AuthErrorMessage.LOGIN_FAILED);
    }

    this.existingUser.password !== password;

    return Promise.resolve(
      User.create({ ...this.existingUser, providerType: OauthProvider.LOCAL }),
    );
  }

  jwtSign(userPayload: UserPayloadDto): Promise<JwtToken> {
    return Promise.resolve(
      JwtToken.create({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        expiresAt: new Date(new Date().getTime() + 1000),
        userId: userPayload.id,
      }),
    );
  }

  rotateRefreshToken(
    prevRefreshToken: string,
    prevAccessToken: string,
  ): Promise<JwtToken> {
    if (this.existingJwtToken.accessToken !== prevAccessToken) {
      throw new UnauthorizedException(
        AuthErrorMessage.INCONSISTENT_ACCESS_TOKEN,
      );
    }
    if (this.existingJwtToken.refreshToken !== prevRefreshToken) {
      throw new UnauthorizedException(AuthErrorMessage.INVALID_REFRESH_TOKEN);
    }

    return Promise.resolve(
      JwtToken.create({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
        expiresAt: new Date(new Date().getTime() + 1000),
        userId: this.existingJwtToken.userId,
      }),
    );
  }

  validateOrSignupOauthUser(oauthPayload: OauthPayloadDto): Promise<User> {
    if (this.existingUser.email === oauthPayload.email) {
      if (this.existingUser.providerType !== oauthPayload.providerType) {
        throw new UnauthorizedException(
          AuthErrorMessage.OAUTH_PROVIDER_UNMATCHED[
            this.existingUser.providerType
          ],
        );
      }
      return Promise.resolve(this.existingUser);
    }

    return Promise.resolve(
      User.create({
        id: 9999,
        ...oauthPayload,
      }),
    );
  }
}
