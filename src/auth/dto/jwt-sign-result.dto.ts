import { JwtToken } from '../entity/jwt-token.entity';

export class JwtSignResultDto {
  private constructor(
    readonly userId: number,
    readonly accessToken: string,
    readonly refreshToken: string,
  ) {}

  static create(createInfo: {
    userId: number;
    accessToken: string;
    refreshToken: string;
  }) {
    return new JwtSignResultDto(
      createInfo.userId,
      createInfo.accessToken,
      createInfo.refreshToken,
    );
  }

  static fromJwtToken(jwtToken: JwtToken) {
    return JwtSignResultDto.create(jwtToken);
  }
}
