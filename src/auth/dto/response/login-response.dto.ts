import { JwtSignResultDto } from '../jwt-sign-result.dto';

export class LoginResponseDto {
  readonly userId: number;
  readonly accessToken: string;

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
