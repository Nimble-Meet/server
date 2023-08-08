import { IsNumber } from 'class-validator';

export class MeetIdParamDto {
  @IsNumber()
  meetId!: number;

  protected constructor(meetId: number) {
    this.meetId = meetId;
  }

  static create({ meetId }: { meetId: number }): MeetIdParamDto {
    return new MeetIdParamDto(meetId);
  }
}
