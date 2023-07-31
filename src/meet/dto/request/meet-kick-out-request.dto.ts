import { ApiProperty } from '@nestjs/swagger';

export class MeetKickOutRequestDto {
  @ApiProperty({
    example: 'user@email.com',
    description: '강퇴할 사용자의 이메일',
  })
  email: string;

  protected constructor(email: string) {
    this.email = email;
  }
}
