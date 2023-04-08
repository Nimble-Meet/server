import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export class UserRepository extends Repository<User> {
  async findOneByEmail(email: string): Promise<User> {
    return this.findOne({ where: { email } });
  }
}
