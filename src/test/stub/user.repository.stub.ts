import { User } from 'src/user/entities/user.entity';
import { IUserRepository } from 'src/user/repository/user.repository.interface';

export class UserRepositoryStub implements IUserRepository {
  private readonly userList: User[];

  constructor(userList: readonly User[]) {
    this.userList = userList.map((user) => User.create(user));
  }

  async findOneById(id: number): Promise<User | null> {
    const isIdEquals = (user: User) => user.id === id;
    return Promise.resolve(this.userList.find(isIdEquals) || null);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const isEmailEquals = (user: User) => user.email === email;
    return Promise.resolve(this.userList.find(isEmailEquals) || null);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const isEmailEquals = (user: User) => user.email === email;
    return Promise.resolve(this.userList.some(isEmailEquals));
  }

  async existsByNickname(nickname: string): Promise<boolean> {
    const isNicknameEquals = (user: User) => user.nickname === nickname;
    return Promise.resolve(this.userList.some(isNicknameEquals));
  }

  async save(user: User): Promise<User> {
    this.userList.push(user);
    return Promise.resolve(user.clone());
  }
}
