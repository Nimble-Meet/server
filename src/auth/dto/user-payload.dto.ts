import { User } from 'src/user/entities/user.entity';

export class UserPayloadDto {
  id: number;
  email: string;
  nickname: string;

  private constructor(user: User) {
    this.email = user.email;
    this.nickname = user.nickname;
    this.id = user.id;
  }

  static from(user: User) {
    return new UserPayloadDto(user);
  }
}
