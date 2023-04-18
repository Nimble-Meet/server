import { User } from 'src/user/entities/user.entity';

export class UserPayloadDto {
  constructor(
    readonly id: number,
    readonly email: string,
    readonly nickname: string,
  ) {}

  static from(user: User) {
    return new UserPayloadDto(user.id, user.email, user.nickname);
  }
}
