import * as t from 'typed-assert';

import { Test, TestingModule } from '@nestjs/testing';

import { User } from 'src/user/entities/user.entity';

import { IUserRepository } from 'src/user/repository/user.repository.interface';
import { IUserService } from './user.service.interface';

import { UserServiceImpl } from './user.service';
import { createUser, EMAIL } from '../test/dummies/user.dummy';
import { UserRepositoryStub } from '../test/stub/user.repository.stub';

describe('UserServiceImpl', () => {
  const getTestingModule = (userRepository: IUserRepository) =>
    Test.createTestingModule({
      providers: [
        {
          provide: IUserRepository,
          useValue: userRepository,
        },
        {
          provide: IUserService,
          useClass: UserServiceImpl,
        },
      ],
    }).compile();

  describe('getUserByEmail', () => {
    const userList = Object.freeze([createUser({})]);
    let userService: IUserService;

    beforeEach(async () => {
      const module: TestingModule = await getTestingModule(
        new UserRepositoryStub(userList),
      );
      userService = module.get<IUserService>(IUserService);
    });

    it('존재하는 user id를 이용하여 호출하면 해당하는 사용자를 반환', async () => {
      // given
      const email = EMAIL;

      // when
      const user = await userService.getUserByEmail(email);

      // then
      expect(user).not.toBe(null);
      t.isNotNull(user);
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe(EMAIL);
    });

    it('존재하지 않는 user id를 이용하여 호출하면 null 반환', async () => {
      // given
      const email = 'new@email.com';

      // when
      const user = await userService.getUserByEmail(email);

      // then
      expect(user).toBe(null);
    });
  });
});
