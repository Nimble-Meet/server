import { UserPayloadDto } from '../dto/user-payload.dto';
import { Strategy } from 'passport-local';

import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { IAuthService } from '../auth.service.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(IAuthService)
    private authService: IAuthService,
  ) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<UserPayloadDto> {
    const user = await this.authService.validateLocalUser(email, password);
    return UserPayloadDto.from(user);
  }
}
