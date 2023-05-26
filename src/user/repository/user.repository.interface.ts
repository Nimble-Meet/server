import { User } from '../entities/user.entity';

export interface IUserRepository {
  findOneByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByNickname(nickname: string): Promise<boolean>;
  findOneById(id: number): Promise<User | null>;
  save(user: User): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');
