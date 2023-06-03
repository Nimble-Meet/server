import { EncryptedPassword } from './EncryptedPassword';
import { JwtToken } from './entity/jwt-token.entity';

import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';

import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import { UserPayloadDto } from './dto/user-payload.dto';
import { TokenService } from './token.service';
import { IUserRepository } from 'src/user/repository/user.repository.interface';
import { IJwtTokenRepository } from './repository/jwt-token.repository.interface';
import { AuthErrorMessage } from './auth.error-message';
import { IAuthService } from './auth.service.interface';
import { OauthProvider } from '../common/enums/oauth-provider.enum';
import { OauthPayloadDto } from './dto/oauth-payload.dto';

@Injectable()
export class AuthServiceImpl implements IAuthService {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IJwtTokenRepository)
    private readonly jwtTokenRepository: IJwtTokenRepository,
  ) {}

  async signup(localSignupDto: LocalSignupRequestDto): Promise<User> {
    const isEmailAlreadyExists = await this.userRepository.existsByEmail(
      localSignupDto.email,
    );
    if (isEmailAlreadyExists) {
      throw new ConflictException(AuthErrorMessage.EMAIL_ALREADY_EXISTS);
    }

    const encryptedPassword = EncryptedPassword.encryptFrom(
      localSignupDto.password,
    );

    const user = User.create({
      ...localSignupDto,
      password: encryptedPassword.getPassword(),
      providerType: OauthProvider.LOCAL,
    });

    return await this.userRepository.save(user);
  }

  async validateLocalUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException(AuthErrorMessage.LOGIN_FAILED);
    }
    if (user.providerType !== OauthProvider.LOCAL || !user.password) {
      throw new UnauthorizedException(
        AuthErrorMessage.OAUTH_PROVIDER_UNMATCHED[user.providerType],
      );
    }

    const encryptedPassword = EncryptedPassword.from(user.password);
    if (!encryptedPassword.equals(password)) {
      throw new UnauthorizedException(AuthErrorMessage.LOGIN_FAILED);
    }

    return user;
  }

  async validateOrSignupOauthUser(
    oauthPayload: OauthPayloadDto,
  ): Promise<User> {
    const findUser = await this.userRepository.findOneByEmail(
      oauthPayload.email,
    );
    if (findUser) {
      if (findUser.providerType !== oauthPayload.providerType) {
        throw new UnauthorizedException(
          AuthErrorMessage.OAUTH_PROVIDER_UNMATCHED[findUser.providerType],
        );
      }
      return findUser;
    }

    const user = User.create(oauthPayload);
    return await this.userRepository.save(user);
  }

  async jwtSign(userPayload: UserPayloadDto): Promise<JwtToken> {
    const userId = userPayload.id;

    const accessToken = this.tokenService.generateAccessToken(userId);
    const refreshToken = this.tokenService.generateRefreshToken(userId);

    const tokenId = await this.jwtTokenRepository.findTokenIdByUserId(userId);
    const existsToken = !!tokenId;

    const newToken = JwtToken.create({
      ...(existsToken && { id: tokenId }),
      userId,
      accessToken,
      refreshToken,
      expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
    });

    return await this.jwtTokenRepository.save(newToken);
  }

  async rotateRefreshToken(
    prevRefreshToken: string,
    prevAccessToken: string,
  ): Promise<JwtToken> {
    const jwtToken = await this.jwtTokenRepository.findOneByRefreshToken(
      prevRefreshToken,
    );
    if (!jwtToken) {
      throw new UnauthorizedException(AuthErrorMessage.INVALID_REFRESH_TOKEN);
    }
    if (!jwtToken.equalsAccessToken(prevAccessToken)) {
      throw new UnauthorizedException(
        AuthErrorMessage.INCONSISTENT_ACCESS_TOKEN,
      );
    }

    let userId: number;
    try {
      const jwtPayload = this.tokenService.verifyRefreshToken(prevRefreshToken);
      userId = jwtPayload.userId;
    } catch {
      throw new UnauthorizedException(AuthErrorMessage.EXPIRED_REFRESH_TOKEN);
    }

    const newAccessToken = this.tokenService.generateAccessToken(userId);
    const newRefreshToken = this.tokenService.generateRefreshToken(userId);

    const newJwtToken = Object.assign(jwtToken, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
    });
    return await this.jwtTokenRepository.save(newJwtToken);
  }
}
