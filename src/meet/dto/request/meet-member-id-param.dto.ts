import { MeetIdParamDto } from './meet-id-param.dto';
import { IsNumber } from 'class-validator';

export class MeetMemberIdParamDto extends MeetIdParamDto {
  @IsNumber()
  memberId!: string;

  private constructor(meetId: string, memberId: string) {
    super(meetId);
    this.memberId = memberId;
  }

  static create({
    meetId,
    memberId,
  }: {
    meetId: string;
    memberId: string;
  }): MeetMemberIdParamDto {
    return new MeetMemberIdParamDto(meetId, memberId);
  }
}
