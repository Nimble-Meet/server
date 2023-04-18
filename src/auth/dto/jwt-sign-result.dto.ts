import { JwtToken } from '../entity/jwt-token.entity';

export class JwtSignResultDto {
  private constructor(
    readonly userId: number,
    readonly accessToken: string,
    readonly refreshToken: string,
  ) {}

  static fromJwtToken(jwtToken: JwtToken) {
    return new JwtSignResultDto(
      jwtToken.userId,
      jwtToken.accessToken,
      jwtToken.refreshToken,
    );
  }
}
