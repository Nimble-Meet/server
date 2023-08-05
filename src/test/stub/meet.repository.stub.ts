import { Meet } from '../../meet/entities/meet.entity';
import { IMeetRepository } from '../../meet/repository/meet.repository.interface';

export class MeetRepositoryStub implements IMeetRepository {
  private readonly meetList: Meet[];

  constructor(meetList: readonly Meet[]) {
    this.meetList = meetList.map((meet) => Meet.create(meet));
  }

  async findHostedOrInvitedMeetsByUserId(userId: number): Promise<Meet[]> {
    const isHostedMeet = async (meet: Meet) => (await meet.host).id === userId;
    const isInvitedMeet = async (meet: Meet) => {
      const meetToMembers = await meet.meetToMembers;
      const members = await Promise.all(
        meetToMembers.map((meetToMember) => meetToMember.member),
      );
      return members.some((member) => member.id === userId);
    };

    const isHostedOrInvited = await Promise.all(
      this.meetList.map((meet) =>
        Promise.all([isHostedMeet(meet), isInvitedMeet(meet)]).then(
          ([isHosted, isInvited]) => isHosted || isInvited,
        ),
      ),
    );

    return this.meetList.filter((_, index) => isHostedOrInvited[index]);
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
