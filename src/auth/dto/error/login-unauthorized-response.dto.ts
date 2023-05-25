import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AuthErrorMessage } from 'src/auth/auth.error-message';
import { IErrorResponseBody } from 'src/common/interface/error-response-body.interface';

export class LoginUnauthorizedResponseDto implements IErrorResponseBody {
  @ApiProperty({
    example: HttpStatus.UNAUTHORIZED,
    description: 'HTTP 상태 코드',
  })
  statusCode!: number;

  @ApiProperty({
    example: AuthErrorMessage.LOGIN_FAILED,
    description: '에러 메시지',
  })
  message!: string;

  @ApiProperty({
    example: 'Unauthorized',
    description: '에러 종류',
  })
  error!: string;
}
