import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepositoryImpl
  extends Repository<User>
  implements IUserRepository
{
  constructor(private readonly dataSource: DataSource) {
    super(
      User,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.findOne({ where: { email } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return (await this.count({ where: { email } })) > 0;
  }

  async existsByNickname(nickname: string): Promise<boolean> {
    return (await this.count({ where: { nickname } })) > 0;
  }
}
