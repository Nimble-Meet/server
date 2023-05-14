import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { IAuthService } from './auth.service.interface';
import { AuthServiceStub } from '../test/stub/auth.service.stub';
import { AuthController } from './auth.controller';
import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import * as crypto from 'crypto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { OauthProvider } from '../common/enums/oauth-provider.enum';
import { User } from '../user/entities/user.entity';

describe('AuthController', () => {
  const getTestingModule = (userService: IAuthService) =>
    Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: IAuthService,
          useValue: userService,
        },
        AuthController,
      ],
    }).compile();

  describe('signup', () => {
    const existingUser = User.create({
      id: 1,
      email: 'existing@mail.com',
      password: 'existing_user_password',
      nickname: 'existing_user',
      providerType: OauthProvider.LOCAL,
    });

    let authController: AuthController;
    beforeEach(async () => {
      const module = await getTestingModule(
        new AuthServiceStub(existingUser, null),
      );
      authController = module.get<AuthController>(AuthController);
    });

    it('적절한 회원가입 정보로 요청하면 새로운 유저를 생성하여 일부의 유저 정보를 반환한다.', async () => {
      // given
      const localSignupRequestDto = LocalSignupRequestDto.create({
        email: 'user@email.com',
        password: crypto
          .createHash('sha256')
          .update('password')
          .digest('base64'),
        nickname: 'nickname',
      });

      // when
      const userResponseDto = await authController.signup(
        localSignupRequestDto,
      );

      // then
      expect(
        userResponseDto.equals(
          UserResponseDto.create({
            email: 'user@email.com',
            nickname: 'nickname',
            providerType: OauthProvider.LOCAL,
          }),
        ),
      );
    });
  });
});
