import { IMeetToMemberRepository } from './meet-to-member.repository.interface';
import { DataSource, Repository } from 'typeorm';
import { MeetToMember } from '../entities/meet-to-member.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MeetToMemberRepositoryImpl
  extends Repository<MeetToMember>
  implements IMeetToMemberRepository
{
  constructor(private readonly dataSource: DataSource) {
    super(
      MeetToMember,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }

  async deleteById(id: string): Promise<void> {
    await this.delete({
      id,
    });
  }
}
