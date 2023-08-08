import { JwtToken } from '../entity/jwt-token.entity';

export interface IJwtTokenRepository {
  findOneByRefreshToken(refreshToken: string): Promise<JwtToken | null>;
  findTokenIdByUserId(userId: string): Promise<string | null>;
  save(jwtToken: JwtToken): Promise<JwtToken>;
}

export const IJwtTokenRepository = Symbol('IJwtTokenRepository');
