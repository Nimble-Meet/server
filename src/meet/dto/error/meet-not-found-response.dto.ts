import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { MeetErrorMessage } from '../../meet.error-message';

export class MeetNotFoundResponseDto {
  @ApiProperty({
    example: HttpStatus.NOT_FOUND,
    description: 'HTTP 상태 코드',
  })
  statusCode!: number;

  @ApiProperty({
    example: MeetErrorMessage.MEET_NOT_FOUND,
    description: '에러 메시지',
  })
  message!: string;

  @ApiProperty({
    example: 'Not Found',
    description: '에러 종류',
  })
  error!: string;
}
