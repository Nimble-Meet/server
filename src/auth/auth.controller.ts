import { JwtSignResultDto } from './dto/jwt-sign-result.dto';
import {
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LocalLoginRequestDto } from './dto/request/local-login-request.dto';
import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { Request, Response } from 'express';
import { RequestUser } from '../common/decorators/req-user.decorator';
import { SetRTCookieInterceptor } from './interceptors/set-rt-cookie.interceptor';
import { UserPayloadDto } from './dto/user-payload.dto';
import { UserResponseDto } from './dto/response/user-response.dto';

import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  Req,
  BadRequestException,
  Get,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NeedLogin } from './decorators/need-login.decorator';
import { SignupConflictResponseDto } from './dto/error/signup-conflict-response.dto';
import { LoginUnauthorizedResponseDto } from './dto/error/login-unauthorized-response.dto';
import { RefreshBadrequestResponseDto } from './dto/error/refresh-badrequest-response.dto';
import { RefreshUnauthorizedResponseDto } from './dto/error/refresh-unauthorized-response.dto';
import { WhoamiUnauthorizedResponseDto } from './dto/error/whoami-unauthorized-response.dto';
import { SignupBadrequestResponseDto } from './dto/error/signup-badrequest-response.dto';
import { ErrorMessage } from './enum/error-message.enum';
import { LogoutUnauthorizedResponseDto } from './dto/error/logout-unauthorized-response.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ description: 'email & pw 회원가입' })
  @ApiBody({
    description: '이메일, 비밀번호(SHA256 인코딩), 닉네임',
    type: LocalSignupRequestDto,
  })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: '이메일/닉네임 형식이 잘못됨',
    type: SignupBadrequestResponseDto,
  })
  @ApiConflictResponse({
    description: '이미 존재하는 이메일/닉네임',
    type: SignupConflictResponseDto,
  })
  async signup(
    @Body() localSignupDto: LocalSignupRequestDto,
  ): Promise<UserResponseDto> {
    const user = await this.authService.signup(localSignupDto);
    return UserResponseDto.fromUser(user);
  }

  @Post('login/local')
  @ApiOperation({ description: 'email & pw 로그인' })
  @ApiBody({
    description: '이메일, 비밀번호(SHA256 인코딩)',
    type: LocalLoginRequestDto,
  })
  @ApiCreatedResponse({
    description: '로그인 성공',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '로그인 실패',
    type: LoginUnauthorizedResponseDto,
  })
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(SetRTCookieInterceptor)
  async login(
    @RequestUser() userPayload: UserPayloadDto,
  ): Promise<JwtSignResultDto> {
    const jwtToken = await this.authService.jwtSign(userPayload);
    return JwtSignResultDto.fromJwtToken(jwtToken);
  }

  @Post('refresh')
  @ApiOperation({
    description:
      'refesh 토큰을 사용하여 access 토큰을 재발급하고, refresh 토큰도 재발급',
  })
  @ApiCreatedResponse({
    description: 'access token & refresh token 재발급 성공',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'access token/refresh token이 요청에 존재하지 않음',
    type: RefreshBadrequestResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '적절하지 않은 access token/refresh token',
    type: RefreshUnauthorizedResponseDto,
  })
  @UseInterceptors(SetRTCookieInterceptor)
  @ApiBearerAuth('access-token')
  async refresh(@Req() req: Request): Promise<JwtSignResultDto> {
    const prevRefreshToken = req.cookies['refresh_token'];
    if (!prevRefreshToken) {
      throw new BadRequestException(ErrorMessage.REFRESH_TOKEN_DOES_NOT_EXIST);
    }

    const prevAccessToken = req.headers.authorization?.split(' ')[1];
    if (!prevAccessToken) {
      throw new BadRequestException(ErrorMessage.ACCESS_TOKEN_DOES_NOT_EXIST);
    }

    const jwtToken = await this.authService.rotateRefreshToken(
      prevRefreshToken,
      prevAccessToken,
    );
    return JwtSignResultDto.fromJwtToken(jwtToken);
  }

  @Get('whoami')
  @ApiOperation({
    description:
      'refesh 토큰을 사용하여 access 토큰을 재발급하고, refresh 토큰도 재발급',
  })
  @ApiOkResponse({
    description: '인증 성공',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
    type: WhoamiUnauthorizedResponseDto,
  })
  @NeedLogin()
  async whoami(
    @RequestUser() userPayload: UserPayloadDto,
  ): Promise<UserResponseDto> {
    return UserResponseDto.fromUserPayload(userPayload);
  }

  @Post('logout')
  @ApiOperation({
    description: 'access token, refresh token 만료 처리',
  })
  @ApiNoContentResponse({
    description: '로그아웃 성공',
  })
  @ApiUnauthorizedResponse({
    description: '사용자 인증 실패',
    type: LogoutUnauthorizedResponseDto,
  })
  @NeedLogin()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const accessToken = req.headers.authorization.split(' ')[1];
    await this.authService.logout(accessToken);
    res.clearCookie('refresh_token');
  }
}
