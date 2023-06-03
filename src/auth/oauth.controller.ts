import { JwtSignResultDto } from './dto/jwt-sign-result.dto';

import { RequestUser } from '../common/decorators/req-user.decorator';
import { SetRTCookieInterceptor } from './interceptors/set-rt-cookie.interceptor';
import { UserPayloadDto } from './dto/user-payload.dto';

import {
  Controller,
  UseGuards,
  Get,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IAuthService } from './auth.service.interface';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { OauthPayloadDto } from './dto/oauth-payload.dto';

@ApiTags('auth')
@Controller('api/auth/login')
export class OauthController {
  constructor(
    @Inject(IAuthService)
    private readonly authService: IAuthService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleLogin(): Promise<void> {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseInterceptors(SetRTCookieInterceptor)
  async googleLoginCallback(
    @RequestUser() oauthPayload: OauthPayloadDto,
  ): Promise<JwtSignResultDto> {
    const user = await this.authService.validateOrSignupOauthUser(oauthPayload);
    const jwtToken = await this.authService.jwtSign(UserPayloadDto.from(user));
    return JwtSignResultDto.fromJwtToken(jwtToken);
  }
}
