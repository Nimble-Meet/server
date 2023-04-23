import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ErrorMessage } from 'src/auth/enum/error-message.enum';
import { IErrorResponseBody } from 'src/common/interface/error-response-body.interface';

export class RefreshUnauthorizedResponseDto implements IErrorResponseBody {
  @ApiProperty({
    example: HttpStatus.UNAUTHORIZED,
    description: 'HTTP 상태 코드',
  })
  statusCode: number;

  @ApiProperty({
    example: ErrorMessage.EXPIRED_REFRESH_TOKEN,
    description: '에러 메시지',
  })
  message: string;

  @ApiProperty({
    example: 'Unauthorized',
    description: '에러 종류',
  })
  error: string;
}
