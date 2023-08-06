import { Test, TestingModule } from '@nestjs/testing';
import { IMeetRepository } from './repository/meet.repository.interface';
import { IMeetService } from './meet.service.interface';
import {
  createMeet,
  MEET_DESCRIPTION,
  MEET_ID,
  MEET_NAME,
} from '../test/dummies/meet.dummy';
import { createUser, USER_ID } from '../test/dummies/user.dummy';
import { MeetServiceImpl } from './meet.service';
import { MeetToMember } from './entities/meet-to-member.entity';
import { MeetRepositoryStub } from '../test/stub/meet.repository.stub';
import { MeetCreateRequestDto } from './dto/request/meet-create-request.dto';
import { IUserRepository } from '../user/repository/user.repository.interface';
import { UserRepositoryStub } from '../test/stub/user.repository.stub';
import { MeetToMemberRepositoryStub } from '../test/stub/meet-to-member.repository.stub';
import { IMeetToMemberRepository } from './repository/meet-to-member.repository.interface';
import { MeetIdParamDto } from './dto/request/meet-id-param.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MeetErrorMessage } from './meet.error-message';
import { UserPayloadDto } from '../auth/dto/user-payload.dto';
import { MeetInviteRequestDto } from './dto/request/meet-invite-request.dto';
import { INVITE_LIMIT_NUMBER } from './meet.constant';
import { UserErrorMessage } from '../user/user.error-message';
import { MeetMemberIdParamDto } from './dto/request/meet-member-id-param.dto';

describe('MeetServiceImpl', () => {
  const getTestingModule = (
    meetRepository: IMeetRepository,
    userRepository: IUserRepository,
  ) =>
    Test.createTestingModule({
      providers: [
        {
          provide: IMeetRepository,
          useValue: meetRepository,
        },
        {
          provide: IUserRepository,
          useValue: userRepository,
        },
        {
          provide: IMeetToMemberRepository,
          useValue: new MeetToMemberRepositoryStub(),
        },
        {
          provide: IMeetService,
          useClass: MeetServiceImpl,
        },
      ],
    }).compile();

  describe('getHostedOrInvitedMeets', () => {
    const OTHER_ID = 2;

    const user = createUser({
      id: USER_ID,
      email: 'user@email.com',
      nickname: 'user',
    });
    const other = createUser({
      id: OTHER_ID,
      email: 'other@email.com',
      nickname: 'other',
    });

    const hostedMeet = createMeet({ host: user });
    const invitedMeet = createMeet({
      host: other,
    });
    invitedMeet.meetToMembers = [
      MeetToMember.create({
        meet: invitedMeet,
        member: user,
      }),
    ];
    const meetList = Object.freeze([hostedMeet, invitedMeet]);

    let meetService: IMeetService;
    beforeEach(async () => {
      const module: TestingModule = await getTestingModule(
        new MeetRepositoryStub(meetList),
        new UserRepositoryStub([user, other]),
      );
      meetService = module.get<IMeetService>(IMeetService);
    });

    it('유저가 생성하거나 초대된 모임을 조회', async () => {
      // given
      const userId = USER_ID;

      // when
      const meets = await meetService.getHostedOrInvitedMeets(userId);

      // then
      expect(meets).toBeInstanceOf(Array);
      expect(meets.length).toEqual(2);
    });

    it('생성하거나 초대한 모임이 없는 경우 빈 배열 반환', async () => {
      // given
      const userId = 999;

      // when
      const meets = await meetService.getHostedOrInvitedMeets(userId);

      // then
      expect(meets).toBeInstanceOf(Array);
      expect(meets.length).toEqual(0);
    });
  });

  describe('createMeet', () => {
    const user = createUser({});
    let meetService: IMeetService;
    beforeEach(async () => {
      const module: TestingModule = await getTestingModule(
        new MeetRepositoryStub([]),
        new UserRepositoryStub([user]),
      );
      meetService = module.get<IMeetService>(IMeetService);
    });

    it('생성할 모임 정보로 요청하면 생성 후 모임 정보를 반환', async () => {
      // given
      const userId = USER_ID;
      const meetCreateRequestDto = MeetCreateRequestDto.create({
        meetName: MEET_NAME,
        description: MEET_DESCRIPTION,
      });

      // when
      const meet = await meetService.createMeet(userId, meetCreateRequestDto);

      // then
      expect(meet).not.toBeNull();
      expect(await meet.host).toEqual(createUser({}));
      expect(meet.meetName).toEqual(meetCreateRequestDto.meetName);
      expect(meet.description).toEqual(meetCreateRequestDto.description);
    });

    it('존재하지 않는 userId로 요청할 경우 에러 발생', async () => {
      // given
      const userId = 999;
      const meetCreateRequestDto = MeetCreateRequestDto.create({
        meetName: MEET_NAME,
        description: MEET_DESCRIPTION,
      });

      // when
      // then
      await expect(
        meetService.createMeet(userId, meetCreateRequestDto),
      ).rejects.toThrow();
    });
  });

  describe('getMeet', () => {
    const INVITED_MEET_ID = 2;
    const OTHER_MEET_ID = 3;

    const user = createUser({
      id: 1,
      email: 'user@email.com',
      nickname: 'user',
    });
    const other = createUser({
      id: 2,
      email: 'other@email.com',
      nickname: 'other',
    });

    const hostedMeet = createMeet({
      id: MEET_ID,
      host: user,
    });
    const invitedMeet = createMeet({
      id: INVITED_MEET_ID,
      host: other,
    });
    const otherMeet = createMeet({
      id: OTHER_MEET_ID,
      host: other,
    });
    invitedMeet.meetToMembers = [
      MeetToMember.create({
        meet: invitedMeet,
        member: user,
      }),
    ];
    const meetList = Object.freeze([hostedMeet, invitedMeet, otherMeet]);

    let meetService: IMeetService;
    beforeEach(async () => {
      const module: TestingModule = await getTestingModule(
        new MeetRepositoryStub(meetList),
        new UserRepositoryStub([user, other]),
      );
      meetService = module.get<IMeetService>(IMeetService);
    });

    it('자신이 생성한 미팅을 미팅 id로 조회하면 모팅 정보를 반환', async () => {
      // given
      const userId = USER_ID;
      const meetId = MEET_ID;
      const meetIdParamDto = MeetIdParamDto.create({ meetId });

      // when
      const meet = await meetService.getMeet(userId, meetIdParamDto);

      // then
      expect(meet).not.toBeNull();
      expect(meet).toEqual(hostedMeet);
    });

    it('초대 받은 미팅을 미팅 id로 조회하면 모팅 정보를 반환', async () => {
      // given
      const userId = USER_ID;
      const meetId = INVITED_MEET_ID;
      const meetIdParamDto = MeetIdParamDto.create({ meetId });

      // when
      const meet = await meetService.getMeet(userId, meetIdParamDto);

      // then
      expect(meet).not.toBeNull();
      expect(meet).toEqual(invitedMeet);
    });

    it('생성하거나 초대 받지 않은 미팅을 조회하면 MEET_NOT_FOUND 에러', async () => {
      // given
      const userId = USER_ID;
      const meetId = OTHER_MEET_ID;
      const meetIdParamDto = MeetIdParamDto.create({ meetId });

      // when
      // then
      await expect(meetService.getMeet(userId, meetIdParamDto)).rejects.toThrow(
        new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND),
      );
    });

    it('존재하지 않는 미팅 id로 요청하면 MEET_NOT_FOUND 에러', async () => {
      // given
      const userId = USER_ID;
      const meetId = 999;

      const meetIdParamDto = MeetIdParamDto.create({ meetId });

      // when
      // then
      await expect(meetService.getMeet(userId, meetIdParamDto)).rejects.toThrow(
        new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND),
      );
    });
  });

  describe('invite', () => {
    const USER_EMAIL = 'user@email.com';
    const MEMBER_EMAIL = 'member@email.com';
    const OTHER_EMAIL = 'other@email.com';
    const MEET_MEMBER_OVER_ID = 2;

    const USER = createUser({
      id: 1,
      email: USER_EMAIL,
      nickname: 'user',
    });
    const MEMBER = createUser({
      id: 2,
      email: MEMBER_EMAIL,
      nickname: 'member',
    });
    const OTHER = createUser({
      id: 3,
      email: OTHER_EMAIL,
      nickname: 'other',
    });

    const MEET = createMeet({
      id: MEET_ID,
      host: USER,
    });
    MEET.meetToMembers = [
      MeetToMember.create({
        meet: MEET,
        member: MEMBER,
      }),
    ];
    const MEET_MEMBER_OVER = createMeet({
      id: MEET_MEMBER_OVER_ID,
      host: USER,
    });
    MEET_MEMBER_OVER.meetToMembers = Array(INVITE_LIMIT_NUMBER).fill(
      MeetToMember.create({
        meet: MEET_MEMBER_OVER,
        member: MEMBER,
      }),
    );

    const meetList = Object.freeze([MEET, MEET_MEMBER_OVER]);
    const userList = Object.freeze([USER, MEMBER, OTHER]);

    let meetService: IMeetService;
    beforeEach(async () => {
      const module: TestingModule = await getTestingModule(
        new MeetRepositoryStub(meetList),
        new UserRepositoryStub(userList),
      );
      meetService = module.get<IMeetService>(IMeetService);
    });

    it('유효한 정보로 미팅 초대를 요청하면 멤버 초대 후 멤버 정보를 반환', async () => {
      // given
      const user = USER;
      const meetId = MEET_ID;
      const emailToInvite = OTHER_EMAIL;

      const userPayloadDto = UserPayloadDto.from(user);
      const meetIdParamDto = MeetIdParamDto.create({ meetId });
      const meetInviteRequestDto = MeetInviteRequestDto.create({
        email: emailToInvite,
      });

      // when
      const meetToMember = await meetService.invite(
        userPayloadDto,
        meetIdParamDto,
        meetInviteRequestDto,
      );

      // then
      expect(meetToMember).not.toBeNull();
      expect(meetToMember).toEqual(
        MeetToMember.create({
          meet: MEET,
          member: OTHER,
        }),
      );
    });

    it('존재하지 않는 미팅 id로 미팅 초대를 요청하면 NotFoundException 발생', async () => {
      // given
      const user = USER;
      const meetId = 999;
      const emailToInvite = OTHER_EMAIL;

      const userPayloadDto = UserPayloadDto.from(user);
      const meetIdParamDto = MeetIdParamDto.create({ meetId });
      const meetInviteRequestDto = MeetInviteRequestDto.create({
        email: emailToInvite,
      });

      // when
      // then
      await expect(
        meetService.invite(
          userPayloadDto,
          meetIdParamDto,
          meetInviteRequestDto,
        ),
      ).rejects.toThrow(new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND));
    });

    it('호스트가 아닌 사용자가 미팅 초대를 요청하면 NotFoundException 발생', async () => {
      // given
      const user = OTHER;
      const meetId = MEET_ID;
      const emailToInvite = USER_EMAIL;

      const userPayloadDto = UserPayloadDto.from(user);
      const meetIdParamDto = MeetIdParamDto.create({ meetId });
      const meetInviteRequestDto = MeetInviteRequestDto.create({
        email: emailToInvite,
      });

      // when
      // then
      await expect(
        meetService.invite(
          userPayloadDto,
          meetIdParamDto,
          meetInviteRequestDto,
        ),
      ).rejects.toThrow(new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND));
    });

    it('참여 가능 인원을 초과한 미팅에 초대를 요청하면 ConflictException 발생', async () => {
      // given
      const user = USER;
      const meetId = MEET_MEMBER_OVER_ID;
      const emailToInvite = OTHER_EMAIL;

      const userPayloadDto = UserPayloadDto.from(user);
      const meetIdParamDto = MeetIdParamDto.create({ meetId });
      const meetInviteRequestDto = MeetInviteRequestDto.create({
        email: emailToInvite,
      });

      // when
      // then
      await expect(
        meetService.invite(
          userPayloadDto,
          meetIdParamDto,
          meetInviteRequestDto,
        ),
      ).rejects.toThrow(
        new ConflictException(MeetErrorMessage.MEET_INVITE_LIMIT_OVER),
      );
    });

    it('존재하지 않는 사용자 이메일로 초대를 요청하면 ConflictException 발생', async () => {
      // given
      const user = USER;
      const meetId = MEET_ID;
      const emailToInvite = 'notfound@email.com';

      const userPayloadDto = UserPayloadDto.from(user);
      const meetIdParamDto = MeetIdParamDto.create({ meetId });
      const meetInviteRequestDto = MeetInviteRequestDto.create({
        email: emailToInvite,
      });

      // when
      // then
      await expect(
        meetService.invite(
          userPayloadDto,
          meetIdParamDto,
          meetInviteRequestDto,
        ),
      ).rejects.toThrow(
        new ConflictException(UserErrorMessage.USER_NOT_FOUND_BY_EMAIL),
      );
    });

    it('이미 가입한 이메일로 초대를 요청하면 ConflictException 발생', async () => {
      // given
      const user = USER;
      const meetId = MEET_ID;
      const emailToInvite = MEMBER_EMAIL;

      const userPayloadDto = UserPayloadDto.from(user);
      const meetIdParamDto = MeetIdParamDto.create({ meetId });
      const meetInviteRequestDto = MeetInviteRequestDto.create({
        email: emailToInvite,
      });

      // when
      // then
      await expect(
        meetService.invite(
          userPayloadDto,
          meetIdParamDto,
          meetInviteRequestDto,
        ),
      ).rejects.toThrow(
        new ConflictException(MeetErrorMessage.USER_ALREADY_INVITED),
      );
    });
  });

  describe('kickOut', () => {
    const USER_EMAIL = 'user@email.com';
    const MEMBER_EMAIL = 'member@email.com';
    const OTHER_EMAIL = 'other@email.com';
    const MEET_TO_MEMBER_ID = 1;

    const USER = createUser({
      id: 1,
      email: USER_EMAIL,
      nickname: 'user',
    });
    const MEMBER = createUser({
      id: 2,
      email: MEMBER_EMAIL,
      nickname: 'member',
    });

    const MEET = createMeet({
      id: MEET_ID,
      host: USER,
    });
    MEET.meetToMembers = [
      MeetToMember.create({
        id: MEET_TO_MEMBER_ID,
        meet: MEET,
        member: MEMBER,
      }),
    ];

    const meetList = Object.freeze([MEET]);
    const userList = Object.freeze([USER, MEMBER]);

    let meetService: IMeetService;
    beforeEach(async () => {
      const module: TestingModule = await getTestingModule(
        new MeetRepositoryStub(meetList),
        new UserRepositoryStub(userList),
      );
      meetService = module.get<IMeetService>(IMeetService);
    });

    it('유효한 정보로 미팅 강퇴를 요청하면 멤버 강퇴 후 강퇴한 멤버 정보를 반환', async () => {
      // given
      const user = USER;
      const meetId = MEET_ID;
      const meetToMemberId = MEET_TO_MEMBER_ID;

      const userPayloadDto = UserPayloadDto.from(user);
      const meetMemberIdParamDto = MeetMemberIdParamDto.create({
        meetId,
        memberId: meetToMemberId,
      });

      // when
      const meetToMember = await meetService.kickOut(
        userPayloadDto,
        meetMemberIdParamDto,
      );

      // then
      expect(meetToMember).not.toBeNull();
      expect(meetToMember.id).toBe(MEET_TO_MEMBER_ID);
      expect(meetToMember.meet.id).toBe(MEET_ID);
      expect(meetToMember.member.id).toBe(MEMBER.id);
    });

    it('존재하지 않는 미팅 id로 미팅 강퇴를 요청하면 NotFoundException 발생', async () => {
      // given
      const user = USER;
      const meetId = 999;
      const meetToMemberId = MEET_TO_MEMBER_ID;

      const userPayloadDto = UserPayloadDto.from(user);
      const meetMemberIdParamDto = MeetMemberIdParamDto.create({
        meetId,
        memberId: meetToMemberId,
      });

      // when
      // then
      await expect(
        meetService.kickOut(userPayloadDto, meetMemberIdParamDto),
      ).rejects.toThrow(new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND));
    });

    it('호스트가 아닌 사용자가 미팅 강퇴를 요청하면 NotFoundException 발생', async () => {
      // given
      const user = createUser({
        id: 999,
      });
      const meetId = MEET_ID;
      const meetToMemberId = MEET_TO_MEMBER_ID;

      const userPayloadDto = UserPayloadDto.from(user);
      const meetMemberIdParamDto = MeetMemberIdParamDto.create({
        meetId,
        memberId: meetToMemberId,
      });

      // when
      // then
      await expect(
        meetService.kickOut(userPayloadDto, meetMemberIdParamDto),
      ).rejects.toThrow(new NotFoundException(MeetErrorMessage.MEET_NOT_FOUND));
    });

    it('존재하지 않는 멤버 id로 강퇴를 요청하면 ConflictException 발생', async () => {
      // given
      const user = USER;
      const meetId = MEET_ID;
      const meetToMemberId = 999;

      const userPayloadDto = UserPayloadDto.from(user);
      const meetMemberIdParamDto = MeetMemberIdParamDto.create({
        meetId,
        memberId: meetToMemberId,
      });

      // when
      // then
      await expect(
        meetService.kickOut(userPayloadDto, meetMemberIdParamDto),
      ).rejects.toThrow(
        new NotFoundException(MeetErrorMessage.MEMBER_NOT_FOUND),
      );
    });
  });
});
