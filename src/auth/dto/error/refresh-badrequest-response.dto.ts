import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ErrorMessage } from 'src/auth/enum/error-message.enum';
import { IErrorResponseBody } from 'src/common/interface/error-response-body.interface';

export class RefreshBadrequestResponseDto implements IErrorResponseBody {
  @ApiProperty({
    example: HttpStatus.BAD_REQUEST,
    description: 'HTTP 상태 코드',
  })
  statusCode: number;

  @ApiProperty({
    example: ErrorMessage.ACCESS_TOKEN_DOES_NOT_EXIST,
    description: '에러 메시지',
  })
  message: string;

  @ApiProperty({
    example: 'Bad Request',
    description: '에러 종류',
  })
  error: string;
}
