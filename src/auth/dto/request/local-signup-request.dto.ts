import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { IsUserNickname } from 'src/user/user.validator';
import { LocalLoginRequestDto } from './local-login-request.dto';

export class LocalSignupRequestDto extends LocalLoginRequestDto {
  @IsString()
  @IsUserNickname()
  @ApiProperty({
    example: 'username',
    description: '사용자의 닉네임',
  })
  nickname: string;
}
