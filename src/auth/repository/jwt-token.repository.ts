import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { JwtToken } from '../entity/jwt-token.entity';
import { IJwtTokenRepository } from './jwt-token.repository.interface';

@Injectable()
export class JwtTokenRepositoryImpl
  extends Repository<JwtToken>
  implements IJwtTokenRepository
{
  constructor(private readonly dataSource: DataSource) {
    super(
      JwtToken,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }

  async findOneByRefreshToken(refreshToken: string): Promise<JwtToken | null> {
    return await this.findOne({ where: { refreshToken } });
  }

  async findTokenIdByUserId(userId: number): Promise<number | null> {
    const findedToken = await this.findOne({
      where: { userId },
      select: ['id'],
    });
    return findedToken?.id || null;
  }
}
