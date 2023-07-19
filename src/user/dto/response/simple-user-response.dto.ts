import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { User } from 'src/user/entities/user.entity';
import { IsUserEmail, IsUserNickname } from 'src/user/user.validator';

export class SimpleUserResponseDto {
  @IsUserEmail()
  @ApiProperty({
    example: 'user@google.com',
    description: '사용자의 이메일',
  })
  private readonly email: string;

  @IsString()
  @IsUserNickname()
  @ApiProperty({
    example: 'username',
    description: '사용자의 닉네임',
  })
  private readonly nickname: string;

  private constructor(email: string, nickname: string) {
    this.email = email;
    this.nickname = nickname;
  }

  static create(createInfo: { email: string; nickname: string }) {
    return new SimpleUserResponseDto(createInfo.email, createInfo.nickname);
  }

  static fromUser(user: User) {
    return SimpleUserResponseDto.create(user);
  }
}
