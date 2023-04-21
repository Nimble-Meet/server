import { ApiProperty } from '@nestjs/swagger';
import { JwtSignResultDto } from '../jwt-sign-result.dto';

export class LoginResponseDto {
  @ApiProperty({
    example: 1,
    description: '사용자의 id',
  })
  private readonly userId: number;

  @ApiProperty({
    example: 'sample-access-token',
    description: 'access token',
  })
  private readonly accessToken: string;

  private constructor(userId: number, accessToken: string) {
    this.userId = userId;
    this.accessToken = accessToken;
  }

  static create(createInfo: { userId: number; accessToken: string }) {
    return new LoginResponseDto(createInfo.userId, createInfo.accessToken);
  }

  static fromJwtSignResult(jwtSignResult: JwtSignResultDto) {
    return LoginResponseDto.create(jwtSignResult);
  }
}
