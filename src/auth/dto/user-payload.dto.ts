import { User } from 'src/user/entities/user.entity';

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
    return UserPayloadDto.create(user);
  }
}
