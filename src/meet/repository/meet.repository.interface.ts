import { Meet } from '../entities/meet.entity';

export interface IMeetRepository {
  findHostedOrInvitedMeetsByUserId(userId: number): Promise<Meet[]>;

  save(meet: Meet): Promise<Meet>;
}

export const IMeetRepository = Symbol('IMeetRepository');
