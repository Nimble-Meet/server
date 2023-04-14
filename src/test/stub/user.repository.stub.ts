import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repository/user.repository.interface';
import { EMAIL, ENCRYPTED_PASSWORD, NICKNAME } from '../dummies/user.dummy';

const isUserExists = (email: string) => email === EMAIL;

const DUMMY_USER = Object.freeze(
  User.create({
    email: EMAIL,
    nickname: NICKNAME,
    password: ENCRYPTED_PASSWORD.getPassword(),
  }),
);

export class UserRepositoryStub implements UserRepository {
  async findOneByEmail(email: string): Promise<User> {
    return Promise.resolve(isUserExists(email) ? DUMMY_USER : null);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return Promise.resolve(isUserExists(email));
  }

  async save(user: User): Promise<User> {
    return Promise.resolve(User.create(user));
  }
}
