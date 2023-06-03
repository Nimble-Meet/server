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
import {
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IAuthService } from './auth.service.interface';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { OauthPayloadDto } from './dto/oauth-payload.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { GoogleLoginUnauthorizedResponseDto } from './dto/error/google-login-unauthorized-response.dto';

@ApiTags('oauth')
@Controller('api/auth/login')
export class OauthController {
  constructor(
    @Inject(IAuthService)
    private readonly authService: IAuthService,
  ) {}

  @Get('google')
  @ApiOperation({ description: '구글 로그인/회원가입' })
  @ApiFoundResponse({
    description: '구글 계정 인증 페이지 이동',
  })
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleLogin(): Promise<void> {}

  @Get('google/callback')
  @ApiOperation({ description: '구글 로그인/회원가입 콜백 URL' })
  @ApiFoundResponse({
    description: '구글 oauth 정보 기반 로그인/회원가입 처리',
  })
  @ApiCreatedResponse({
    description: '구글 로그인/회원가입 성공',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '다른 로그인 방식으로 가입한 이메일',
    type: GoogleLoginUnauthorizedResponseDto,
  })
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
