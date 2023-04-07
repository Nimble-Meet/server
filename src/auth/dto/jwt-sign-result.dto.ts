import { JwtToken } from '../entity/jwt-token.entity';

export class JwtSignResultDto {
  readonly userId: number;
  readonly accessToken: string;
  readonly refreshToken: string;

  private constructor(partial: Partial<JwtSignResultDto>) {
    Object.assign(this, partial);
  }

  static fromJwtToken(jwtToken: JwtToken) {
    return new JwtSignResultDto({
      userId: jwtToken.userId,
      accessToken: jwtToken.accessToken,
      refreshToken: jwtToken.refreshToken,
    });
  }
}
