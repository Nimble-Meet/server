import { JwtSignResultDto } from './dto/jwt-sign-result.dto';
import {
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LocalLoginRequestDto } from './dto/request/local-login-request.dto';
import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { Request } from 'express';
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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NeedLogin } from './decorators/need-login.decorator';

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
  @ApiBadRequestResponse({ description: '적절하지 않은 이메일/비밀번호' })
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
  @ApiUnauthorizedResponse({
    description: 'access token 재발급에 실패했습니다.',
  })
  @ApiBadRequestResponse({ description: '유효하지 않은 요청입니다.' })
  @UseInterceptors(SetRTCookieInterceptor)
  @ApiBearerAuth('access-token')
  async refresh(@Req() req: Request): Promise<JwtSignResultDto> {
    const prevRefreshToken = req.cookies['refresh_token'];
    if (!prevRefreshToken) {
      throw new BadRequestException('리프레시 토큰이 존재하지 않습니다.');
    }

    const prevAccessToken = req.headers.authorization?.split(' ')[1];
    if (!prevAccessToken) {
      throw new BadRequestException('엑세스 토큰이 존재하지 않습니다.');
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
    description: '로그인하지 않은 사용자입니다.',
  })
  @NeedLogin()
  async whoami(
    @RequestUser() userPayload: UserPayloadDto,
  ): Promise<UserResponseDto> {
    return UserResponseDto.fromUserPayload(userPayload);
  }
}
