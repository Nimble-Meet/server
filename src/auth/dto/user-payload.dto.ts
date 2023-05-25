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
    if (!user.id) {
      throw new TypeError(
        'user id가 falsy 합니다. UserPayloadDto 생성을 위해서는 user id가 정의되어 있어야 합니다.',
      );
    }
    return UserPayloadDto.create({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      providerType: user.providerType,
    });
  }
}
