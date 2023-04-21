import { User } from 'src/user/entities/user.entity';
import { IUserRepository } from 'src/user/repository/user.repository.interface';

export class UserRepositoryStub implements IUserRepository {
  private readonly userList: User[];

  constructor(userList: readonly User[]) {
    this.userList = userList.map((user) => User.create(user));
  }

  async findOneById(id: number): Promise<User> {
    const isIdEquals = (user: User) => user.id === id;
    return Promise.resolve(this.userList.find(isIdEquals));
  }

  async findOneByEmail(email: string): Promise<User> {
    const isEmailEquals = (user: User) => user.email === email;
    return Promise.resolve(this.userList.find(isEmailEquals));
  }

  async existsByEmail(email: string): Promise<boolean> {
    const isEmailEquals = (user: User) => user.email === email;
    return Promise.resolve(this.userList.some(isEmailEquals));
  }

  async save(user: User): Promise<User> {
    const findedUserIndex = this.userList.findIndex(
      (token) => token.id === user.id,
    );
    if (findedUserIndex > 0) {
      this.userList.splice(findedUserIndex, 1);
    }

    this.userList.push(user);
    return Promise.resolve(User.create(user));
  }
}
