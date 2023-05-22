import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IErrorResponseBody } from 'src/common/interface/error-response-body.interface';

export class SignupBadrequestResponseDto implements IErrorResponseBody {
  @ApiProperty({
    example: HttpStatus.BAD_REQUEST,
    description: 'HTTP 상태 코드',
  })
  statusCode: number;

  @ApiProperty({
    example: ['sha256으로 인코딩된 문자열이 아닙니다.'],
    description: '에러 메시지',
  })
  message: string;

  @ApiProperty({
    example: 'Bad Request',
    description: '에러 종류',
  })
  error: string;

  constructor(statusCode: number, message: string, error: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
  }
}
