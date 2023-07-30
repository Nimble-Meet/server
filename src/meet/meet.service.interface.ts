import { Meet } from './entities/meet.entity';

export interface IMeetService {
  getHostedOrInvitedMeets(userId: number): Promise<Meet[]>;
}

export const IMeetService = Symbol('IMeetService');
