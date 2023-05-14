// implements IAuthService

import { IAuthService } from '../../auth/auth.service.interface';
import { UserPayloadDto } from '../../auth/dto/user-payload.dto';
import { JwtToken } from '../../auth/entity/jwt-token.entity';
import { LocalSignupRequestDto } from '../../auth/dto/request/local-signup-request.dto';
import { User } from '../../user/entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ErrorMessage } from '../../auth/enum/error-message.enum';

export class AuthServiceStub implements IAuthService {
  private readonly existingUser: User;
  private readonly existingJwtToken: JwtToken;

  constructor(existingUser: User, existingJwtToken: JwtToken) {
    this.existingUser = Object.freeze(existingUser);
    this.existingJwtToken = Object.freeze(existingJwtToken);
  }

  signup(localSignupDto: LocalSignupRequestDto): Promise<User> {
    if (this.existingUser.email === localSignupDto.email) {
      throw new ConflictException(ErrorMessage.EMAIL_ALREADY_EXISTS);
    }
    if (this.existingUser.nickname === localSignupDto.nickname) {
      throw new ConflictException(ErrorMessage.NICKNAME_ALREADY_EXISTS);
    }

    return Promise.resolve(User.create(localSignupDto));
  }

  validateLocalUser(email: string, password: string): Promise<User> {
    if (
      this.existingUser.email !== email ||
      this.existingUser.password !== password
    ) {
      throw new UnauthorizedException(ErrorMessage.LOGIN_FAILED);
    }

    return Promise.resolve(User.create(this.existingUser));
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
      throw new UnauthorizedException(ErrorMessage.INCONSISTENT_ACCESS_TOKEN);
    }
    if (this.existingJwtToken.refreshToken !== prevRefreshToken) {
      throw new UnauthorizedException(ErrorMessage.INVALID_REFRESH_TOKEN);
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
}
