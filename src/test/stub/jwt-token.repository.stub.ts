import { JwtToken } from 'src/auth/entity/jwt-token.entity';
import { IJwtTokenRepository } from 'src/auth/repository/jwt-token.repository.interface';

export class JwtTokenRepositoryStub implements IJwtTokenRepository {
  private readonly jwtTokenList: JwtToken[];

  constructor(jwtTokenList: readonly JwtToken[]) {
    this.jwtTokenList = jwtTokenList.map((token) => token.clone());
  }

  async findTokenIdByUserId(userId: string): Promise<string | null> {
    const isUserIdEquals = (token: JwtToken) => token.userId === userId;
    return Promise.resolve(this.jwtTokenList.find(isUserIdEquals)?.id || null);
  }

  async save(jwtToken: JwtToken): Promise<JwtToken> {
    this.jwtTokenList.push(jwtToken);
    return Promise.resolve(jwtToken);
  }

  async findOneByRefreshToken(refreshToken: string): Promise<JwtToken | null> {
    const isRefreshTokenEquals = (token: JwtToken) =>
      token.refreshToken === refreshToken;
    return Promise.resolve(
      this.jwtTokenList.find(isRefreshTokenEquals) || null,
    );
  }
}
