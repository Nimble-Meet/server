import { Meet } from '../entities/meet.entity';

export interface IMeetRepository {
  findHostedOrInvitedMeetsByUserId(userId: number): Promise<Meet[]>;

  findMeetByIdIfHostedOrInvited(
    meetId: number,
    userId: number,
  ): Promise<Meet | null>;

  save(meet: Meet): Promise<Meet>;
}

export const IMeetRepository = Symbol('IMeetRepository');
