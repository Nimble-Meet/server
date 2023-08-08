import { Meet } from './entities/meet.entity';
import { MeetCreateRequestDto } from './dto/request/meet-create-request.dto';
import { MeetIdParamDto } from './dto/request/meet-id-param.dto';
import { MeetInviteRequestDto } from './dto/request/meet-invite-request.dto';
import { UserPayloadDto } from '../auth/dto/user-payload.dto';
import { MeetToMember } from './entities/meet-to-member.entity';
import { MeetMemberIdParamDto } from './dto/request/meet-member-id-param.dto';

export interface IMeetService {
  getHostedOrInvitedMeets(userPayloadDto: UserPayloadDto): Promise<Meet[]>;

  createMeet(
    userPayloadDto: UserPayloadDto,
    meetCreateRequestDto: MeetCreateRequestDto,
  ): Promise<Meet>;

  getMeet(
    userPayloadDto: UserPayloadDto,
    getMeetRequestDto: MeetIdParamDto,
  ): Promise<Meet>;

  invite(
    userPayloadDto: UserPayloadDto,
    meetIdParamDto: MeetIdParamDto,
    meetInviteRequestDto: MeetInviteRequestDto,
  ): Promise<MeetToMember>;

  kickOut(
    userPayloadDto: UserPayloadDto,
    meetMemberIdParamDto: MeetMemberIdParamDto,
  ): Promise<MeetToMember>;
}

export const IMeetService = Symbol('IMeetService');
