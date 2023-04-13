import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { JwtToken } from '../entity/jwt-token.entity';
import { JwtTokenRepository } from './jwt-token.repository.interface';

@Injectable()
export class JwtTokenRepositoryImpl
  extends Repository<JwtToken>
  implements JwtTokenRepository
{
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
