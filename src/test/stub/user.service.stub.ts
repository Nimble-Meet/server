import { IUserService } from '../../user/user.service.interface';
import { User } from '../../user/entities/user.entity';

export class UserServiceStub implements IUserService {
  private readonly existingUser: User;

  constructor(existingUser: User) {
    this.existingUser = Object.freeze(existingUser);
  }
  getUserByEmail(email: string) {
    if (this.existingUser.email === email) {
      return Promise.resolve(this.existingUser);
    }
    return Promise.resolve(null);
  }
}
