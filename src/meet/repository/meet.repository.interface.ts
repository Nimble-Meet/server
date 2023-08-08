import { Meet } from '../entities/meet.entity';

export interface IMeetRepository {
  findHostedOrInvitedMeetsByUserId(userId: string): Promise<Meet[]>;

  findMeetByIdIfHostedOrInvited(
    meetId: string,
    userId: string,
  ): Promise<Meet | null>;

  save(meet: Meet): Promise<Meet>;

  findJoinedMeetById(meetId: string): Promise<null | Meet>;
}

export const IMeetRepository = Symbol('IMeetRepository');
