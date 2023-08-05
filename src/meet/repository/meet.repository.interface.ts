import { Meet } from '../entities/meet.entity';
import { MeetToMember } from '../entities/meet-to-member.entity';

export interface IMeetRepository {
  findHostedOrInvitedMeetsByUserId(userId: number): Promise<Meet[]>;

  findMeetByIdIfHostedOrInvited(
    meetId: number,
    userId: number,
  ): Promise<Meet | null>;

  save(meet: Meet): Promise<Meet>;

  findJoinedMeetById(meetId: number): Promise<null | Meet>;

  saveMeetToMemberAndMeet(
    meetToMember: MeetToMember,
    meet: Meet,
  ): Promise<void>;
}

export const IMeetRepository = Symbol('IMeetRepository');
