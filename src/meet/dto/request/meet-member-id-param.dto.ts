import { MeetIdParamDto } from './meet-id-param.dto';
import { IsNumber } from 'class-validator';

export class MeetMemberIdParamDto extends MeetIdParamDto {
  @IsNumber()
  memberId!: number;
}
