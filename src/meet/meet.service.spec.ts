import { Test, TestingModule } from '@nestjs/testing';
import { IMeetRepository } from './repository/meet.repository.interface';
import { IMeetService } from './meet.service.interface';
import { createMeet } from '../test/dummies/meet.dummy';
import { createUser, USER_ID } from '../test/dummies/user.dummy';
import { MeetServiceImpl } from './meet.service';
import { MeetToMember } from './entities/meet-to-member.entity';
import { MeetRepositoryStub } from '../test/stub/meet.repository.stub';

describe('MeetServiceImpl', () => {
  const getTestingModule = (meetRepository: IMeetRepository) =>
    Test.createTestingModule({
      providers: [
        {
          provide: IMeetRepository,
          useValue: meetRepository,
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
});
