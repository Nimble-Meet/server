import { MeetIdParamDto } from './meet-id-param.dto';
import { IsNumber } from 'class-validator';

export class MeetMemberIdParamDto extends MeetIdParamDto {
  @IsNumber()
  memberId!: number;

  private constructor(meetId: number, memberId: number) {
    super(meetId);
    this.memberId = memberId;
  }

  static create({
    meetId,
    memberId,
  }: {
    meetId: number;
    memberId: number;
  }): MeetMemberIdParamDto {
    return new MeetMemberIdParamDto(meetId, memberId);
  }
}
