import { IsNotEmpty, IsNumber } from 'class-validator';

export class JwtPayloadDto {
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  private constructor(userId) {
    this.userId = userId;
  }

  static create(createInfo: { userId: number }) {
    return new JwtPayloadDto(createInfo.userId);
  }
}
