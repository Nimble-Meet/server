import { User } from '../entities/user.entity';

export interface IUserRepository {
  findOneByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  findOneById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');
