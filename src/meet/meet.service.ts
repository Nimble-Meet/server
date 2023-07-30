import { IMeetService } from './meet.service.interface';
import { Meet } from './entities/meet.entity';
import { Inject, Injectable } from '@nestjs/common';
import { IMeetRepository } from './repository/meet.repository.interface';

@Injectable()
export class MeetServiceImpl implements IMeetService {
  constructor(
    @Inject(IMeetRepository)
    private readonly meetRepository: IMeetRepository,
  ) {}
  async getHostedOrInvitedMeets(userId: number): Promise<Meet[]> {
    const meets = await this.meetRepository.findHostedOrInvitedMeetsByUserId(
      userId,
    );
    return meets;
  }
}
