import { Meet } from './entities/meet.entity';
import { MeetCreateRequestDto } from './dto/request/meet-create-request.dto';
import { GetMeetRequestDto } from './dto/request/get-meet-request.dto';

export interface IMeetService {
  getHostedOrInvitedMeets(userId: number): Promise<Meet[]>;

  createMeet(
    userId: number,
    meetCreateRequestDto: MeetCreateRequestDto,
  ): Promise<Meet>;

  getMeet(userId: number, getMeetRequestDto: GetMeetRequestDto): Promise<Meet>;
}

export const IMeetService = Symbol('IMeetService');
