import * as t from 'typed-assert';
import { IMeetService } from './meet.service.interface';
import { Meet } from './entities/meet.entity';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IMeetRepository } from './repository/meet.repository.interface';
import { MeetCreateRequestDto } from './dto/request/meet-create-request.dto';
import { IUserRepository } from '../user/repository/user.repository.interface';
import { MeetIdParamDto } from './dto/request/meet-id-param.dto';
import { MeetErrorMessage } from './meet.error-message';
import { MeetInviteRequestDto } from './dto/request/meet-invite-request.dto';
import { UserErrorMessage } from '../user/user.error-message';
import { INVITE_LIMIT_NUMBER } from './meet.constant';
import { MeetToMember } from './entities/meet-to-member.entity';
import { UserPayloadDto } from '../auth/dto/user-payload.dto';
import { IMeetToMemberRepository } from './repository/meet-to-member.repository.interface';
import { MeetMemberIdParamDto } from './dto/request/meet-member-id-param.dto';

@Injectable()
export class MeetServiceImpl implements IMeetService {
  constructor(
    @Inject(IMeetRepository)
    private readonly meetRepository: IMeetRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IMeetToMemberRepository)
    private readonly meetToMemberRepository: IMeetToMemberRepository,
  ) {}
  async getHostedOrInvitedMeets(
    userPayloadDto: UserPayloadDto,
  ): Promise<Meet[]> {
    const meets = await this.meetRepository.findHostedOrInvitedMeetsByUserId(
      userPayloadDto.id,
    );
    return meets;
  }

  async createMeet(
    userPayloadDto: UserPayloadDto,
    meetCreateRequestDto: MeetCreateRequestDto,
  ): Promise<Meet> {
    const user = await this.userRepository.findOneById(userPayloadDto.id);
    t.isNotNull(user);

    return await this.meetRepository.save(
      Meet.create({
        meetName: meetCreateRequestDto.meetName,
        description: meetCreateRequestDto.description,
        host: user,
      }),
    );
  }

  async getMeet(
    userPayloadDto: UserPayloadDto,
    getMeetRequestDto: MeetIdParamDto,
  ): Promise<Meet> {
    const meet = await this.meetRepository.findMeetByIdIfHostedOrInvited(
      getMeetRequestDto.meetId,
      userPayloadDto.id,
    );
    if (!meet) {
      throw new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND);
    }
    return meet;
  }

  async invite(
    userPayloadDto: UserPayloadDto,
    meetIdParamDto: MeetIdParamDto,
    meetInviteRequestDto: MeetInviteRequestDto,
  ): Promise<MeetToMember> {
    const meet = await this.meetRepository.findJoinedMeetById(
      meetIdParamDto.meetId,
    );
    if (!meet) {
      throw new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND);
    }

    if (!meet.isHost(userPayloadDto.id)) {
      throw new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND);
    }

    t.isArray(meet.meetToMembers);
    if (meet.meetToMembers.length >= INVITE_LIMIT_NUMBER) {
      throw new ConflictException(MeetErrorMessage.MEET_INVITE_LIMIT_OVER);
    }

    const { email } = meetInviteRequestDto;
    const userToInvite = await this.userRepository.findOneByEmail(email);
    if (!userToInvite) {
      throw new ConflictException(UserErrorMessage.USER_NOT_FOUND_BY_EMAIL);
    }
    if (
      meet.meetToMembers.some(
        (meetToMember) => meetToMember.member.email === email,
      )
    ) {
      throw new ConflictException(MeetErrorMessage.USER_ALREADY_INVITED);
    }

    const meetToMember = MeetToMember.create({
      meet: meet,
      member: userToInvite,
    });
    const savedMeetToMember = await this.meetToMemberRepository.save(
      meetToMember,
    );

    return savedMeetToMember;
  }

  async kickOut(
    userPayloadDto: UserPayloadDto,
    meetMemberIdParamDto: MeetMemberIdParamDto,
  ): Promise<MeetToMember> {
    const meet = await this.meetRepository.findJoinedMeetById(
      meetMemberIdParamDto.meetId,
    );
    if (!meet) {
      throw new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND);
    }

    if (!meet.isHost(userPayloadDto.id)) {
      throw new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND);
    }

    const findMeetToMember = meet.findMember(meetMemberIdParamDto.memberId);
    if (!findMeetToMember) {
      throw new NotFoundException(MeetErrorMessage.MEMBER_NOT_FOUND);
    }

    await this.meetToMemberRepository.deleteById(meetMemberIdParamDto.memberId);

    return findMeetToMember;
  }
}
