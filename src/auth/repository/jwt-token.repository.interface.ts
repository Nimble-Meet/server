import { JwtToken } from '../entity/jwt-token.entity';

export interface JwtTokenRepository {
  findOneByRefreshToken(refreshToken: string): Promise<JwtToken>;
  findTokenIdByUserId(userId: number): Promise<number>;
  save(jwtToken: JwtToken): Promise<JwtToken>;
}
