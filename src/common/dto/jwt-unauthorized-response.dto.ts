import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IErrorResponseBody } from 'src/common/interface/error-response-body.interface';

export class JwtUnauthorizedResponseDto implements IErrorResponseBody {
  @ApiProperty({
    example: HttpStatus.UNAUTHORIZED,
    description: 'HTTP 상태 코드',
  })
  statusCode!: number;

  @ApiProperty({
    example: 'Unauthorized',
    description: '에러 메시지',
  })
  message!: string;
}
