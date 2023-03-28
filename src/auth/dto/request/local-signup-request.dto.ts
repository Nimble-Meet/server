import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { IsSha256Encrypted } from 'src/auth/auth.validator';
import { IsUserEmail, IsUserNickname } from 'src/user/user.validator';

export class LocalSignupRequestDto {
  @IsString()
  @IsUserEmail()
  @ApiProperty({
    example: 'user@google.com',
    description: '사용자의 이메일',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsSha256Encrypted()
  @ApiProperty({
    example: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
    description: 'SHA256으로 암호화된 비밀번호',
  })
  password: string;

  @IsString()
  @IsUserNickname()
  @ApiProperty({
    example: 'username',
    description: '사용자의 닉네임',
  })
  nickname: string;
}
