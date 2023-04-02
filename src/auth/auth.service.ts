import { JwtSignResult } from './types/jwt-sign-result.interface';
import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { User } from 'src/user/entities/user.entity';

import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import { UserService } from '../user/user.service';
import { JwtSubjectType } from './enums/jwt-subject-type.enum';
import { UserPayloadDto } from './dto/user-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(localSignupDto: LocalSignupRequestDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(localSignupDto.password, 10);
    const user = await this.userService.create({
      ...localSignupDto,
      password: hashedPassword,
    });
    return user;
  }

  async validateLocalUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(username);
    if (bcrypt.compareSync(password, user.password)) {
      return user;
    }
    return null;
  }

  jwtSign(userPayload: UserPayloadDto): JwtSignResult {
    const userId = userPayload.id;
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);
    return {
      userId,
      accessToken,
      refreshToken,
    };
  }

  private generateAccessToken(userId: number): string {
    return this.jwtService.sign(
      { id: userId },
      {
        subject: JwtSubjectType.ACCESS,
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      },
    );
  }

  private generateRefreshToken(userId: number): string {
    return this.jwtService.sign(
      { id: userId },
      {
        subject: JwtSubjectType.REFRESH,
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      },
    );
  }
}
