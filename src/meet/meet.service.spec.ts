import { Test, TestingModule } from '@nestjs/testing';
import { IMeetRepository } from './repository/meet.repository.interface';
import { IMeetService } from './meet.service.interface';
import {
  createMeet,
  MEET_DESCRIPTION,
  MEET_NAME,
} from '../test/dummies/meet.dummy';
import { createUser, USER_ID } from '../test/dummies/user.dummy';
import { MeetServiceImpl } from './meet.service';
import { MeetToMember } from './entities/meet-to-member.entity';
import { MeetRepositoryStub } from '../test/stub/meet.repository.stub';
import { MeetCreateRequestDto } from './dto/request/meet-create-request.dto';
import { IUserRepository } from '../user/repository/user.repository.interface';
import { UserRepositoryStub } from '../test/stub/user.repository.stub';

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
          provide: IMeetService,
          useClass: MeetServiceImpl,
        },
      ],
    }).compile();

  describe('getHostedOrInvitedMeets', () => {
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

    const hostedMeet = createMeet({ host: Promise.resolve(user) });
    const invitedMeet = createMeet({
      host: Promise.resolve(other),
    });
    invitedMeet.meetToMembers = Promise.resolve([
      MeetToMember.create({
        meet: invitedMeet,
        member: Promise.resolve(user),
      }),
    ]);
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
});
