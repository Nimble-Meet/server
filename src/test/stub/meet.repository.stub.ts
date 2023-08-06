import { Meet } from '../../meet/entities/meet.entity';
import { IMeetRepository } from '../../meet/repository/meet.repository.interface';
import { MeetToMember } from '../../meet/entities/meet-to-member.entity';

export class MeetRepositoryStub implements IMeetRepository {
  private readonly meetList: Meet[];

  constructor(meetList: readonly Meet[]) {
    this.meetList = meetList.map((meet) => Meet.create(meet));
  }

  findHostedOrInvitedMeetsByUserId(userId: number): Promise<Meet[]> {
    const hostedOrInvitedMeets = this.meetList.filter(
      (meet) => meet.isHost(userId) || meet.isInvited(userId),
    );
    return Promise.resolve(hostedOrInvitedMeets);
  }

  save(meet: Meet): Promise<Meet> {
    return Promise.resolve(meet);
  }

  findMeetByIdIfHostedOrInvited(
    meetId: number,
    userId: number,
  ): Promise<Meet | null> {
    const findMeet = this.meetList.find((meet) => meet.id === meetId);
    if (!findMeet) {
      return Promise.resolve(null);
    }
    if (!findMeet.isHost(userId) && !findMeet.isInvited(userId)) {
      return Promise.resolve(null);
    }
    return Promise.resolve(findMeet);
  }

  findJoinedMeetById(meetId: number): Promise<Meet | null> {
    return Promise.resolve(
      this.meetList.find((meet) => meet.id === meetId) || null,
    );
  }
}
