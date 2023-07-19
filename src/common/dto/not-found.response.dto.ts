import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IErrorResponseBody } from 'src/common/interface/error-response-body.interface';

export class NotFoundResponseDto implements IErrorResponseBody {
  @ApiProperty({
    example: HttpStatus.NOT_FOUND,
    description: 'HTTP 상태 코드',
  })
  statusCode!: number;

  @ApiProperty({
    example: 'Not Found',
    description: '에러 메시지',
  })
  message!: string;
}
