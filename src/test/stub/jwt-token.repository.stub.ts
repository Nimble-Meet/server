import { JwtToken } from 'src/auth/entity/jwt-token.entity';
import { IJwtTokenRepository } from 'src/auth/repository/jwt-token.repository.interface';

export class JwtTokenRepositoryStub implements IJwtTokenRepository {
  private readonly jwtTokenList: JwtToken[];

  constructor(jwtTokenList: readonly JwtToken[]) {
    this.jwtTokenList = jwtTokenList.map((token) => JwtToken.clone(token));
  }

  async findTokenIdByUserId(userId: number): Promise<number> {
    const isUserIdEquals = (token: JwtToken) => token.userId === userId;
    return Promise.resolve(this.jwtTokenList.find(isUserIdEquals)?.id);
  }

  async existsByTokenId(tokenId: number): Promise<boolean> {
    const isIdEquals = (token: JwtToken) => token.id === tokenId;
    return Promise.resolve(this.jwtTokenList.some(isIdEquals));
  }

  async save(jwtToken: JwtToken): Promise<JwtToken> {
    const findedJwtTokenIndex = this.jwtTokenList.findIndex(
      (token) => token.id === jwtToken.id,
    );
    if (findedJwtTokenIndex > 0) {
      this.jwtTokenList.splice(findedJwtTokenIndex, 1);
    }

    this.jwtTokenList.push(jwtToken);
    return Promise.resolve(jwtToken);
  }

  async findOneByRefreshToken(refreshToken: string): Promise<JwtToken> {
    const isRefreshTokenEquals = (token: JwtToken) =>
      token.refreshToken === refreshToken;
    return Promise.resolve(this.jwtTokenList.find(isRefreshTokenEquals));
  }
}
