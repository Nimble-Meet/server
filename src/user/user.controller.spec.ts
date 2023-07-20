import { Test } from '@nestjs/testing';

import { IUserService } from './user.service.interface';
import { UserController } from './user.controller';
import { UserServiceStub } from '../test/stub/user.service.stub';
import { createUser, EMAIL, NICKNAME } from '../test/dummies/user.dummy';
import { GetByEmailRequestDto } from './dto/request/get-by-email-request.dto';
import { SimpleUserResponseDto } from './dto/response/simple-user-response.dto';
import { NotFoundException } from '@nestjs/common';
import { UserErrorMessage } from './user.error-message';

describe('UserController', () => {
  const getTestingModule = (userService: IUserService) =>
    Test.createTestingModule({
      providers: [
        {
          provide: IUserService,
          useValue: userService,
        },
        UserController,
      ],
    }).compile();

  describe('getUserByEmail', () => {
    const existingUser = createUser({});

    let userController: UserController;

    beforeEach(async () => {
      const module = await getTestingModule(new UserServiceStub(existingUser));
      userController = module.get<UserController>(UserController);
    });

    it('존재하는 유저의 이메일로 요청하면 해당 유저의 정보를 담은 dto 반환', async () => {
      // given
      const getByEmailRequestDto = GetByEmailRequestDto.create({
        email: EMAIL,
      });

      // when
      const simpleUserResponseDto = await userController.getUserByEmail(
        getByEmailRequestDto,
      );

      // then
      expect(simpleUserResponseDto).toEqual(
        SimpleUserResponseDto.create({
          email: EMAIL,
          nickname: NICKNAME,
        }),
      );
    });

    it('존재하지 않는 유저의 이메일로 요청하면 BadRequest 에러 발생', async () => {
      // given
      const getByEmailRequestDto = GetByEmailRequestDto.create({
        email: 'not_existing_email@email.com',
      });

      // when
      // then
      await expect(
        userController.getUserByEmail(getByEmailRequestDto),
      ).rejects.toThrow(
        new NotFoundException(UserErrorMessage.USER_NOT_FOUND_BY_EMAIL),
      );
    });
  });
});
