import { Meet } from '../../meet/entities/meet.entity';
import { IMeetRepository } from '../../meet/repository/meet.repository.interface';
import { MeetToMember } from '../../meet/entities/meet-to-member.entity';

export class MeetRepositoryStub implements IMeetRepository {
  private readonly meetList: Meet[];

  constructor(meetList: readonly Meet[]) {
    this.meetList = meetList.map((meet) => Meet.create(meet));
  }

  findHostedOrInvitedMeetsByUserId(userId: number): Promise<Meet[]> {
    const isHostedMeet = (meet: Meet) => meet.host.id === userId;
    const isInvitedMeet = (meet: Meet) =>
      !!meet.meetToMembers?.some(
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

  findJoinedMeetById(meetId: number): Promise<Meet | null> {
    return Promise.resolve(null);
  }

  saveMeetToMemberAndMeet(
    meetToMember: MeetToMember,
    meet: Meet,
  ): Promise<void> {
    return Promise.resolve(undefined);
  }
}
