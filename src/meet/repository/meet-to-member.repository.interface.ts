import { MeetToMember } from '../entities/meet-to-member.entity';

export interface IMeetToMemberRepository {
  save(meetToMember: MeetToMember): Promise<MeetToMember>;

  deleteById(id: string): Promise<void>;
}

export const IMeetToMemberRepository = Symbol('IMeetToMemberRepository');
