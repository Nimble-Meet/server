import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRepository } from './user.repository.interface';

@Injectable()
export class UserRepositoryImpl
  extends Repository<User>
  implements UserRepository
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
}
