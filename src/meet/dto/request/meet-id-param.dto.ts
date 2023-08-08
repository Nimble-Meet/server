import { IsNumber } from 'class-validator';

export class MeetIdParamDto {
  @IsNumber()
  meetId!: string;

  protected constructor(meetId: string) {
    this.meetId = meetId;
  }

  static create({ meetId }: { meetId: string }): MeetIdParamDto {
    return new MeetIdParamDto(meetId);
  }
}
