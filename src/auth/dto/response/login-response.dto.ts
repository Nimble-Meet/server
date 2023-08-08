import { ApiProperty } from '@nestjs/swagger';
import { JwtSignResultDto } from '../jwt-sign-result.dto';

export class LoginResponseDto {
  @ApiProperty({
    example: '1',
    description: '사용자의 id',
  })
  private readonly userId: string;

  @ApiProperty({
    example: 'sample-access-token',
    description: 'access token',
  })
  private readonly accessToken: string;

  private constructor(userId: string, accessToken: string) {
    this.userId = userId;
    this.accessToken = accessToken;
  }

  static create(createInfo: { userId: string; accessToken: string }) {
    return new LoginResponseDto(createInfo.userId, createInfo.accessToken);
  }

  static fromJwtSignResult(jwtSignResult: JwtSignResultDto) {
    return LoginResponseDto.create(jwtSignResult);
  }
}
