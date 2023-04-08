import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { JwtSubjectType } from './enums/jwt-subject-type.enum';

export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(userId: number): string {
    const payloadToSign: JwtPayloadDto = { userId };
    return this.jwtService.sign(payloadToSign, {
      subject: JwtSubjectType.ACCESS,
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });
  }

  generateRefreshToken(userId: number): string {
    const payloadToSign: JwtPayloadDto = { userId };
    return this.jwtService.sign(payloadToSign, {
      subject: JwtSubjectType.REFRESH,
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });
  }

  verifyAccessToken(accessToken: string): JwtPayloadDto {
    return this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  verifyRefreshToken(refreshToken: string): JwtPayloadDto {
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
