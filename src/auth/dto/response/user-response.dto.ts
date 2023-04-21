import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { OauthProvider } from 'src/common/enums/oauth-provider.enum';
import { User } from 'src/user/entities/user.entity';
import { IsUserEmail, IsUserNickname } from 'src/user/user.validator';
import { UserPayloadDto } from '../user-payload.dto';

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

  @IsEnum(OauthProvider)
  @ApiProperty({
    example: 'GOOGLE',
    description: 'oauth provider',
    enum: OauthProvider,
  })
  providerType: string;

  private constructor(email: string, nickname: string, providerType: string) {
    this.email = email;
    this.nickname = nickname;
    this.providerType = providerType;
  }

  static create(createInfo: {
    email: string;
    nickname: string;
    providerType: string;
  }) {
    return new UserResponseDto(
      createInfo.email,
      createInfo.nickname,
      createInfo.providerType,
    );
  }

  static fromUser(user: User) {
    return UserResponseDto.create(user);
  }

  static fromUserPayload(userPayload: UserPayloadDto) {
    return UserResponseDto.create(userPayload);
  }
}
