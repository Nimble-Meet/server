import { ApiProperty } from '@nestjs/swagger';
import { JwtSignResultDto } from '../jwt-sign-result.dto';

export class LoginResponseDto {
  @ApiProperty({
    example: 1,
    description: '사용자의 id',
  })
  userId: number;

  @ApiProperty({
    example: 'sample-access-token',
    description: 'access token',
  })
  accessToken: string;

  private constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }

  static fromJwtSignResult(jwtSignResult: JwtSignResultDto) {
    return new LoginResponseDto({
      userId: jwtSignResult.userId,
      accessToken: jwtSignResult.accessToken,
    });
  }
}
