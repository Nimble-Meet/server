import * as t from 'typed-assert';
import { IMeetService } from './meet.service.interface';
import { Meet } from './entities/meet.entity';
import { Inject, Injectable } from '@nestjs/common';
import { IMeetRepository } from './repository/meet.repository.interface';
import { MeetCreateRequestDto } from './dto/request/meet-create-request.dto';
import { IUserRepository } from '../user/repository/user.repository.interface';
@Injectable()
export class MeetServiceImpl implements IMeetService {
  constructor(
    @Inject(IMeetRepository)
    private readonly meetRepository: IMeetRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}
  async getHostedOrInvitedMeets(userId: number): Promise<Meet[]> {
    const meets = await this.meetRepository.findHostedOrInvitedMeetsByUserId(
      userId,
    );
    return meets;
  }

  async createMeet(
    userId: number,
    meetCreateRequestDto: MeetCreateRequestDto,
  ): Promise<Meet> {
    const user = await this.userRepository.findOneById(userId);
    t.isNotNull(user);

    const meet = await Meet.create({
      meetName: meetCreateRequestDto.meetName,
      host: user,
      description: meetCreateRequestDto.description,
    });

    return meet;
  }
}
