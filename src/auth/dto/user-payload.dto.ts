import { User } from 'src/user/entities/user.entity';

export class UserPayloadDto {
  readonly id: number;
  readonly email: string;
  readonly nickname: string;
  readonly providerType: string;

  private constructor(partial: Partial<UserPayloadDto>) {
    Object.assign(this, partial);
  }

  static create(createInfo: {
    id: number;
    email: string;
    nickname: string;
    providerType: string;
  }) {
    return new UserPayloadDto(createInfo);
  }

  static from(user: User) {
    return new UserPayloadDto(user);
  }
}
