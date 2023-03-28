import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsString } from 'class-validator';

import { OauthProvider } from 'src/common/enums/oauth-provider.enum';
import { User } from 'src/user/entities/user.entity';
import { IsUserEmail, IsUserNickname } from 'src/user/user.validator';

export class UserResponseDto {
  @IsUserEmail()
  @ApiProperty({
    example: 'user@google.com',
    description: '사용자의 이메일',
  })
  email: string;

  @IsString()
  @IsUserNickname()
  @ApiProperty({
    example: 'username',
    description: '사용자의 닉네임',
  })
  nickname: string;

  @IsDate()
  @ApiProperty({
    example: '2023-02-01T00:00:00.000Z',
    description: '가입날짜',
  })
  createdAt: Date;

  @IsEnum(OauthProvider)
  @ApiProperty({
    example: 'GOOGLE',
    description: 'oauth provider',
    enum: OauthProvider,
  })
  provider: string;

  private constructor(user: User) {
    this.email = user.email;
    this.nickname = user.nickname;
    this.createdAt = user.createdAt;
    this.provider = user.provider;
  }

  static from(user: User) {
    return new UserResponseDto(user);
  }
}
