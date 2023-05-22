import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AuthErrorMessage } from 'src/auth/auth.error-message';
import { IErrorResponseBody } from 'src/common/interface/error-response-body.interface';

export class SignupConflictResponseDto implements IErrorResponseBody {
  @ApiProperty({
    example: HttpStatus.CONFLICT,
    description: 'HTTP 상태 코드',
  })
  statusCode: number;

  @ApiProperty({
    example: AuthErrorMessage.EMAIL_ALREADY_EXISTS,
    description: '에러 메시지',
  })
  message: string;

  @ApiProperty({
    example: 'Conflict',
    description: '에러 종류',
  })
  error: string;

  constructor(statusCode: number, message: string, error: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
  }
}
