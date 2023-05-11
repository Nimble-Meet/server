import { UserPayloadDto } from '../dto/user-payload.dto';
import { Strategy } from 'passport-local';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<UserPayloadDto> {
    const user = await this.authService.validateLocalUser(email, password);
    return UserPayloadDto.from(user);
  }
}
