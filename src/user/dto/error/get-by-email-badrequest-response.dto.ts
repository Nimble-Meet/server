import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { IErrorResponseBody } from '../../../common/interface/error-response-body.interface';

export class GetByEmailBadrequestResponseDto implements IErrorResponseBody {
  @ApiProperty({
    example: HttpStatus.BAD_REQUEST,
    description: 'HTTP 상태 코드',
  })
  statusCode!: number;

  @ApiProperty({
    example: ['email must be an email'],
    description: '에러 메시지',
  })
  message!: string;

  @ApiProperty({
    example: 'Bad Request',
    description: '에러 종류',
  })
  error!: string;
}
