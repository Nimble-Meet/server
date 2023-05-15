import { JwtStrategy } from './jwt.strategy';
import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../user/repository/user.repository.interface';
import { UserRepositoryStub } from '../../test/stub/user.repository.stub';
import { createUser, USER_ID } from '../../test/dummies/user.dummy';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { UserPayloadDto } from '../dto/user-payload.dto';
import { UnauthorizedException } from '@nestjs/common';
import { AuthErrorMessage } from '../auth.error-message';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  const userList = [createUser({})];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [
        {
          provide: IUserRepository,
          useValue: new UserRepositoryStub(userList),
        },
        ConfigService,
        JwtStrategy,
      ],
    }).compile();
    jwtStrategy = module.get(JwtStrategy);
  });

  describe('validate', () => {
    it('존재하는 userId로 인증을 요청하면 유저 정보 반환', async () => {
      // given
      const jwtPayloadDto = JwtPayloadDto.create({
        userId: USER_ID,
      });

      // when
      const result = await jwtStrategy.validate(jwtPayloadDto);

      // then
      expect(result).toEqual(UserPayloadDto.from(createUser({})));
    });

    it('존재하지 않는 userId 이면 UnauthorizedException 발생', async () => {
      // given
      const jwtPayloadDto = JwtPayloadDto.create({
        userId: 999,
      });

      // when
      // then
      await expect(jwtStrategy.validate(jwtPayloadDto)).rejects.toThrow(
        new UnauthorizedException(AuthErrorMessage.USER_NOT_FOUND),
      );
    });
  });
});
