import { JwtToken } from 'src/auth/entity/jwt-token.entity';
import { USER_ID } from '../dummies/user.dummy';
import { EXISTING_TOKEN_ID } from '../dummies/jwt-token.dummy';
import { IJwtTokenRepository } from 'src/auth/repository/jwt-token.repository.interface';

const isTokenExists = (tokenId: number) => tokenId === EXISTING_TOKEN_ID;
const isUserHasToken = (userId: number) => userId === USER_ID;

export class JwtTokenRepositoryStub implements IJwtTokenRepository {
  async findTokenIdByUserId(userId: number): Promise<number> {
    return Promise.resolve(isUserHasToken(userId) ? EXISTING_TOKEN_ID : null);
  }

  async existsByTokenId(tokenId: number): Promise<boolean> {
    return Promise.resolve(isTokenExists(tokenId));
  }

  async save(jwtToken: JwtToken): Promise<JwtToken> {
    return Promise.resolve(JwtToken.create(jwtToken));
  }

  // TODO: rotateRefreshToken 테스트 작성하면서 재구현 필요
  async findOneByRefreshToken(refreshToken: string): Promise<JwtToken> {
    return Promise.resolve(JwtToken.create({ id: EXISTING_TOKEN_ID }));
  }
}
