import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class MeetInviteRequestDto {
  @IsEmail()
  @ApiProperty({
    example: 'user@google.com',
    description: '초대할 사용자의 이메일',
  })
  email: string;

  protected constructor(email: string) {
    this.email = email;
  }
}
