import { MeetToMember } from '../entities/meet-to-member.entity';

export interface IMeetToMemberRepository {
  save(meetToMember: MeetToMember): Promise<MeetToMember>;
}

export const IMeetToMemberRepository = Symbol('IMeetToMemberRepository');
