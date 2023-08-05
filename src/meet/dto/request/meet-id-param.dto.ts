import { IsNumber } from 'class-validator';

export class MeetIdParamDto {
  @IsNumber()
  meetId!: number;
}
