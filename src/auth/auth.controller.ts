import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import { AuthService } from './auth.service';
import { UserResponseDto } from './dto/response/user-response.dto';

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
}
