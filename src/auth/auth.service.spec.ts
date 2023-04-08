import { EncryptedPassword } from './EncryptedPassword';
import { UserRepository } from './../user/user.repository';
import { UserModule } from './../user/user.module';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';

import { JwtTokenRepository } from './jwt-token.repository';
import { User } from 'src/user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { createJwtOptions } from './auth.config';
import { anyOfClass, mock, when, instance } from 'ts-mockito';
describe('AuthService', () => {
  let authService: AuthService;
  let jwtTokenRepository: JwtTokenRepository;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let configService: ConfigService;

  const email = 'test@example.com';
  const nickname = 'testuser';
  const password = 'test1234';
  const encryptedPassword = EncryptedPassword.encryptFrom(password);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: createJwtOptions,
          inject: [ConfigService],
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [JwtService, ConfigService],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
    configService = moduleRef.get<ConfigService>(ConfigService);

    const resultUser = User.from({
      email,
      nickname,
      password: encryptedPassword.getPassword(),
    });
    userRepository = mock(UserRepository);
    when(userRepository.save(anyOfClass(User))).thenResolve(resultUser);
    when(userRepository.findOneByEmail(email)).thenResolve(resultUser);

    jwtTokenRepository = mock(JwtTokenRepository);

    authService = new AuthService(
      jwtService,
      configService,
      instance(userRepository),
      instance(jwtTokenRepository),
    );
  });

  describe('signup', () => {
    it('새로운 유저 생성, 비밀번호는 암호화', async () => {
      // given
      const localSignupDto = { email, nickname, password };

      // when
      const user = await authService.signup(localSignupDto);

      // then
      expect(user.email).toBe(localSignupDto.email);
      expect(user.password).not.toBe(localSignupDto.password);
    });
  });

  describe('validateLocalUser', () => {
    it('이메일과 비밀번호가 맞다면 user를 반환', async () => {
      // given

      // when
      const result = await authService.validateLocalUser(email, password);

      // then
      expect(result.email).toBe(email);
      expect(result.password).toBe(encryptedPassword.getPassword());
    });

    it('이메일 비밀번호가 맞지 않다면 null 반환', async () => {
      // given

      // when
      const result = await authService.validateLocalUser(
        email,
        'invalid password',
      );

      // then
      expect(result).toBeNull();
    });
  });
});
