import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { IJwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(userId: string): string {
    const payloadToSign: IJwtPayload = { userId };
    return this.jwtService.sign(payloadToSign, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });
  }

  generateRefreshToken(userId: string): string {
    const payloadToSign: IJwtPayload = { userId };
    return this.jwtService.sign(payloadToSign, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });
  }

  verifyAccessToken(accessToken: string): IJwtPayload {
    return this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  verifyRefreshToken(refreshToken: string): IJwtPayload {
    return this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
    });
  }

  getRefreshTokenExpiresAt(): Date {
    return new Date(
      Date.now() + +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    );
  }
}
