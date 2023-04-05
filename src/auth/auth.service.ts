import { EncryptedPassword } from './EncryptedPassword';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtToken } from './entity/jwt-token.entity';
import { Repository } from 'typeorm';
import { JwtSignResult } from './types/jwt-sign-result.interface';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { User } from 'src/user/entities/user.entity';

import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import { JwtSubjectType } from './enums/jwt-subject-type.enum';
import { UserPayloadDto } from './dto/user-payload.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectRepository(JwtToken)
    private readonly jwtTokenRepository: Repository<JwtToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signup(localSignupDto: LocalSignupRequestDto): Promise<User> {
    const encryptedPassword = await EncryptedPassword.encryptFrom(
      localSignupDto.password,
    );

    const user = User.from({
      ...localSignupDto,
      password: encryptedPassword.valueOf(),
    });

    await this.userRepository.save(user);

    return user;
  }

  async validateLocalUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    const encryptedPassword = new EncryptedPassword(user.password);
    if (encryptedPassword.equals(password)) {
      return user;
    }

    return null;
  }

  async jwtSign(userPayload: UserPayloadDto): Promise<JwtSignResult> {
    const userId = userPayload.id;
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    await this.upsertJwtTokenData(userId, accessToken, refreshToken);

    return {
      userId,
      accessToken,
      refreshToken,
    };
  }

  private generateAccessToken(userId: number): string {
    const payloadToSign: JwtPayloadDto = { userId };
    return this.jwtService.sign(payloadToSign, {
      subject: JwtSubjectType.ACCESS,
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });
  }

  private generateRefreshToken(userId: number): string {
    const payloadToSign: JwtPayloadDto = { userId };
    return this.jwtService.sign(payloadToSign, {
      subject: JwtSubjectType.REFRESH,
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });
  }

  private async upsertJwtTokenData(
    userId: number,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    await this.jwtTokenRepository.upsert(
      {
        userId,
        accessToken,
        refreshToken,
        expiresAt: new Date(
          Date.now() +
            +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        ),
      },
      ['userId'],
    );
  }

  async rotateRefreshToken(
    prevRefreshToken: string,
    prevAccessToken: string,
  ): Promise<JwtSignResult> {
    const { userId } = await this.verifyToken(
      prevRefreshToken,
      prevAccessToken,
    );

    const newAccessToken = this.generateAccessToken(userId);
    const newRefreshToken = this.generateRefreshToken(userId);

    await this.updateJwtTokenData(userId, newAccessToken, newRefreshToken);

    return {
      userId,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async verifyToken(
    prevRefreshToken: string,
    prevAccessToken: string,
  ): Promise<JwtPayloadDto> {
    try {
      const { accessToken } = await this.jwtTokenRepository.findOneOrFail({
        where: { refreshToken: prevRefreshToken },
        select: ['accessToken'],
      });
      if (accessToken !== prevAccessToken) {
        throw Error();
      }
    } catch {
      throw new UnauthorizedException('유효하지 않은 요청입니다.');
    }

    let payload: JwtPayloadDto;
    try {
      payload = await this.jwtService.verifyAsync(prevRefreshToken, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }
    return payload;
  }

  private updateJwtTokenData(
    userId: number,
    newAccessToken: string,
    newRefreshToken: string,
  ): Promise<any> {
    return this.jwtTokenRepository.update(
      { userId },
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt:
          new Date() +
          this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      },
    );
  }
}
