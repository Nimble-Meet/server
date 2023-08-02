import { IsNumber } from 'class-validator';

export class GetMeetRequestDto {
  @IsNumber()
  meetId!: number;
}
