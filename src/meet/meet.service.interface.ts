import { Meet } from './entities/meet.entity';
import { MeetCreateRequestDto } from './dto/request/meet-create-request.dto';
import { MeetIdParamDto } from './dto/request/meet-id-param.dto';
import { MeetInviteRequestDto } from './dto/request/meet-invite-request.dto';
import { UserPayloadDto } from '../auth/dto/user-payload.dto';

export interface IMeetService {
  getHostedOrInvitedMeets(userId: number): Promise<Meet[]>;

  createMeet(
    userId: number,
    meetCreateRequestDto: MeetCreateRequestDto,
  ): Promise<Meet>;

  getMeet(userId: number, getMeetRequestDto: MeetIdParamDto): Promise<Meet>;

  invite(
    userPayloadDto: UserPayloadDto,
    meetIdParamDto: MeetIdParamDto,
    meetInviteRequestDto: MeetInviteRequestDto,
  ): Promise<Meet>;
}

export const IMeetService = Symbol('IMeetService');
