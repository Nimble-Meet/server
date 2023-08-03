import { Meet } from '../../meet/entities/meet.entity';
import { IMeetRepository } from '../../meet/repository/meet.repository.interface';

export class MeetRepositoryStub implements IMeetRepository {
  private readonly meetList: Meet[];

  constructor(meetList: readonly Meet[]) {
    this.meetList = meetList.map((meet) => Meet.create(meet));
  }

  async findHostedOrInvitedMeetsByUserId(userId: number): Promise<Meet[]> {
    const isHostedMeet = async (meet: Meet) => (await meet.host).id === userId;
    const isInvitedMeet = async (meet: Meet) =>
      (await meet.meetToMembers).some(
        (meetToMember) => meetToMember.member.id === userId,
      );
    const hostedOrInvitedMeets = this.meetList.filter(
      (meet) => isHostedMeet(meet) || isInvitedMeet(meet),
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
    return Promise.resolve(null);
  }

  findOneById(meetId: number): Promise<Meet | null> {
    return Promise.resolve(null);
  }
}
