import { User } from '../entities/user.entity';

export interface IUserRepository {
  findOneByEmail(email: string): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
  findOneById(id: number): Promise<User>;
  save(user: User): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');
