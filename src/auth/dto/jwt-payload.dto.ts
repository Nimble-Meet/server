import { IsNotEmpty, IsNumber } from 'class-validator';

export class JwtPayloadDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
