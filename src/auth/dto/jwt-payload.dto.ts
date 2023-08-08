import { IsNotEmpty, IsNumber } from 'class-validator';

export class JwtPayloadDto {
  @IsNumber()
  @IsNotEmpty()
  readonly userId: string;

  private constructor(userId: string) {
    this.userId = userId;
  }

  static create(createInfo: { userId: string }) {
    return new JwtPayloadDto(createInfo.userId);
  }
}
