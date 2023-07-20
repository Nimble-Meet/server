import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IErrorResponseBody } from 'src/common/interface/error-response-body.interface';
import { UserErrorMessage } from '../../user.error-message';

export class GetByEmailNotfoundResponseDto implements IErrorResponseBody {
  @ApiProperty({
    example: HttpStatus.NOT_FOUND,
    description: 'HTTP 상태 코드',
  })
  statusCode!: number;

  @ApiProperty({
    example: UserErrorMessage.USER_NOT_FOUND_BY_EMAIL,
    description: '에러 메시지',
  })
  message!: string;

  @ApiProperty({
    example: 'Not Found',
    description: '에러 종류',
  })
  error!: string;
}
