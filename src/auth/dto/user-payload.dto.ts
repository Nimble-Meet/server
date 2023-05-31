import { User } from 'src/user/entities/user.entity';
import * as t from 'typed-assert';

export class UserPayloadDto {
  private constructor(
    readonly id: number,
    readonly email: string,
    readonly nickname: string,
    readonly providerType: string,
  ) {}

  static create(createInfo: {
    id: number;
    email: string;
    nickname: string;
    providerType: string;
  }) {
    return new UserPayloadDto(
      createInfo.id,
      createInfo.email,
      createInfo.nickname,
      createInfo.providerType,
    );
  }

  static from(user: User) {
    t.isNumber(user.id);
    return UserPayloadDto.create({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      providerType: user.providerType,
    });
  }
}
