import { ApiProperty } from '@nestjs/swagger';

export class MeetInviteRequestDto {
  @ApiProperty({
    example: 'user@email.com',
    description: '초대할 사용자의 이메일',
  })
  email: string;

  protected constructor(email: string) {
    this.email = email;
  }
}
