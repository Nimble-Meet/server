import { ApiProperty } from '@nestjs/swagger';
import { IsUserEmail } from '../../user.validator';

export class GetByEmailRequestDto {
  @IsUserEmail()
  @ApiProperty({
    example: 'user@google.com',
    description: '사용자의 이메일',
  })
  email: string;

  protected constructor(email: string) {
    this.email = email;
  }

  static create = ({ email }: { email: string }) => {
    return new GetByEmailRequestDto(email);
  };
}
