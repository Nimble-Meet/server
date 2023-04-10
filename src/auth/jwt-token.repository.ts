import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { JwtToken } from './entity/jwt-token.entity';

@Injectable()
export class JwtTokenRepository extends Repository<JwtToken> {
  constructor(private readonly dataSource: DataSource) {
    super(
      JwtToken,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }

  async findOneByRefreshToken(refreshToken: string): Promise<JwtToken> {
    return await this.findOne({ where: { refreshToken } });
  }

  async findTokenIdByUserId(userId: number): Promise<number> {
    const findedToken = await this.findOne({
      where: { userId },
      select: ['id'],
    });
    return findedToken?.id;
  }
}
