import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayloadDto } from '../dto/user-payload.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { IUserRepository } from 'src/user/repository/user.repository.interface';
import { ErrorMessage } from '../enum/error-message.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayloadDto): Promise<UserPayloadDto> {
    const user = await this.userRepository.findOneById(payload.userId);
    if (!user) {
      throw new UnauthorizedException(ErrorMessage.USER_NOT_FOUND);
    }

    return UserPayloadDto.from(user);
  }
}
