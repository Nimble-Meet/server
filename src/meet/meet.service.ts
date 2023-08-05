import * as t from 'typed-assert';
import { IMeetService } from './meet.service.interface';
import { Meet } from './entities/meet.entity';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMeetRepository } from './repository/meet.repository.interface';
import { MeetCreateRequestDto } from './dto/request/meet-create-request.dto';
import { IUserRepository } from '../user/repository/user.repository.interface';
import { GetMeetRequestDto } from './dto/request/get-meet-request.dto';
import { MeetErrorMessage } from './meet.error-message';

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

    const { meetName, description } = meetCreateRequestDto;

    return await this.meetRepository.save(
      Meet.create({ meetName, host: user, description }),
    );
  }

  async getMeet(
    userId: number,
    getMeetRequestDto: GetMeetRequestDto,
  ): Promise<Meet> {
    const { meetId } = getMeetRequestDto;
    const meet = await this.meetRepository.findMeetByIdIfHostedOrInvited(
      meetId,
      userId,
    );
    if (!meet) {
      throw new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND);
    }
    return meet;
  }
}
