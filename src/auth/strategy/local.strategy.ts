import { UserPayloadDto } from './../dto/user-payload.dto';
import { Strategy } from 'passport-local';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';
import { ErrorMessage } from '../enum/error-message.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<UserPayloadDto> {
    const user = await this.authService.validateLocalUser(email, password);
    if (!user) {
      throw new UnauthorizedException(ErrorMessage.LOGIN_FAILED);
    }
    return UserPayloadDto.from(user);
  }
}
