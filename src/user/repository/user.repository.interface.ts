import { User } from '../entities/user.entity';

export interface UserRepository {
  findOneByEmail(email: string): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
  save(user: User): Promise<User>;
}
