import { IMeetToMemberRepository } from '../../meet/repository/meet-to-member.repository.interface';
import { MeetToMember } from '../../meet/entities/meet-to-member.entity';

export class MeetToMemberRepositoryStub implements IMeetToMemberRepository {
  deleteById(id: number): Promise<void> {
    return Promise.resolve(undefined);
  }

  save(meetToMember: MeetToMember): Promise<MeetToMember> {
    return Promise.resolve(meetToMember);
  }
}
