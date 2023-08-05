import { IMeetRepository } from './meet.repository.interface';
import { Meet } from '../entities/meet.entity';
import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class MeetRepositoryImpl
  extends Repository<Meet>
  implements IMeetRepository
{
  constructor(private readonly dataSource: DataSource) {
    super(
      Meet,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }

  private createSelectJoinedMeetQuery = () =>
    this.createQueryBuilder('meet')
      .select('meet.id')
      .addSelect('meet.meetName')
      .addSelect('meet.description')
      .addSelect('meet.createdAt')
      .addSelect('meet.host')

      .addSelect('host.email')
      .addSelect('host.nickname')

      .addSelect('meet_to_member.id')
      .addSelect('meet_to_member.member')

      .addSelect('member.email')
      .addSelect('member.nickname')

      .leftJoin('meet.host', 'host')
      .leftJoin('meet.meetToMembers', 'meet_to_member')
      .leftJoin('meet_to_member.member', 'member');

  async findHostedOrInvitedMeetsByUserId(userId: number): Promise<Meet[]> {
    const meets = await this.createSelectJoinedMeetQuery()
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('meet.id')
          .from(Meet, 'meet')
          .leftJoin('meet.meetToMembers', 'meet_to_member')
          .where('meet.hostId = :userId', { userId })
          .orWhere('meet_to_member.memberId = :userId', { userId })
          .getQuery();
        return 'meet.id IN ' + subQuery;
      })
      .orderBy('meet.updatedAt', 'DESC')
      .getMany();
    return meets;
  }

  async findMeetByIdIfHostedOrInvited(
    meetId: number,
    userId: number,
  ): Promise<Meet | null> {
    const meet = this.createSelectJoinedMeetQuery()
      .where('meet.id = :meetId', { meetId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('meet.hostId = :userId', {
            userId,
          }).orWhere('meet_to_member.memberId = :userId', {
            userId,
          });
        }),
      )
      .getOne();
    return meet;
  }

  async findJoinedMeetById(meetId: number): Promise<Meet | null> {
    const meet = await this.createSelectJoinedMeetQuery()
      .where('meet.id = :meetId', { meetId })
      .getOne();
    return meet;
  }
}
