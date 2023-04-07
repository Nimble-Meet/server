import { Repository } from 'typeorm';
import { JwtToken } from './entity/jwt-token.entity';

export class JwtTokenRepository extends Repository<JwtToken> {
  async findOneByRefreshToken(refreshToken: string): Promise<JwtToken> {
    return await this.findOne({ where: { refreshToken } });
  }

  async findTokenIdByUserId(userId: number): Promise<number> {
    const { id: tokenId } = await this.findOne({
      where: { userId },
      select: ['id'],
    });
    return tokenId;
  }
}
