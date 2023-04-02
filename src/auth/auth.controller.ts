import { LoginResponseDto } from './dto/response/login-response.dto';
import { LocalLoginRequestDto } from './dto/request/local-login-request.dto';
import { ConfigService } from '@nestjs/config';

import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { RequestUser } from '../common/decorators/req-user.decorator';
import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import { AuthService } from './auth.service';
import { UserResponseDto } from './dto/response/user-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserPayloadDto } from './dto/user-payload.dto';
import { SetRTCookieInterceptor } from './interceptors/set-rt-cookie.interceptor';
import { JwtSignResult } from './types/jwt-sign-result.interface';
@ApiTags('auth')
@Controller('auth')
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
    return UserResponseDto.from(user);
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
  public login(@RequestUser() userPayload: UserPayloadDto): JwtSignResult {
    return this.authService.jwtSign(userPayload);
  }
}
