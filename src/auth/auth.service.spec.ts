import { EncryptedPassword } from './EncryptedPassword';
import { UserRepository } from './../user/user.repository';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';

import { JwtTokenRepository } from './jwt-token.repository';
import { User } from 'src/user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { createJwtOptions } from './auth.config';
import { anyOfClass, mock, when, instance, anyNumber } from 'ts-mockito';
import { UserPayloadDto } from './dto/user-payload.dto';
import { JwtToken } from './entity/jwt-token.entity';
describe('AuthService', () => {
  let authService: AuthService;
  let jwtTokenRepository: JwtTokenRepository;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let configService: ConfigService;

  const USER_ID = 1;
  const EMAIL = 'test@example.com';
  const NICKNAME = 'testuser';
  const PASSWORD = 'test1234';
  const ENCRYPTED_PASSWORD = EncryptedPassword.encryptFrom(PASSWORD);

  const EXISTING_TOKEN_ID = 1;
  const NEW_TOKEN_ID = 999;

  const isUserExists = (userId: number) => userId === USER_ID;
  const isTokenExists = (tokenId: number) => tokenId === EXISTING_TOKEN_ID;

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
      email: EMAIL,
      nickname: NICKNAME,
      password: ENCRYPTED_PASSWORD.getPassword(),
    });
    userRepository = mock(UserRepository);
    when(userRepository.save(anyOfClass(User))).thenResolve(resultUser);
    when(userRepository.findOneByEmail(EMAIL)).thenResolve(resultUser);

    jwtTokenRepository = mock(JwtTokenRepository);
    when(jwtTokenRepository.findTokenIdByUserId(USER_ID)).thenResolve(
      EXISTING_TOKEN_ID,
    );
    when(jwtTokenRepository.findTokenIdByUserId(anyNumber())).thenCall(
      (userId) =>
        Promise.resolve(isUserExists(userId) ? EXISTING_TOKEN_ID : null),
    );
    when(jwtTokenRepository.save(anyOfClass(JwtToken))).thenCall((token) =>
      Promise.resolve(
        JwtToken.from({
          ...token,
          id: isTokenExists(token.id) ? EXISTING_TOKEN_ID : NEW_TOKEN_ID,
        }),
      ),
    );

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
      const localSignupDto = {
        email: EMAIL,
        nickname: NICKNAME,
        password: PASSWORD,
      };

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
      const result = await authService.validateLocalUser(EMAIL, PASSWORD);

      // then
      expect(result.email).toBe(EMAIL);
      expect(result.password).toBe(ENCRYPTED_PASSWORD.getPassword());
    });

    it('이메일 비밀번호가 맞지 않다면 null 반환', async () => {
      // given

      // when
      const result = await authService.validateLocalUser(
        EMAIL,
        'invalid password',
      );

      // then
      expect(result).toBeNull();
    });
  });

  describe('jwtSign', () => {
    it('이미 로그인했던 user가 다시 요청한 경우, 기존의 JwtToken 데이터를 수정한다.', async () => {
      // given
      const userPayload = new UserPayloadDto(USER_ID, EMAIL, NICKNAME);

      // when
      const result = await authService.jwtSign(userPayload);

      // then
      expect(result).toBeInstanceOf(JwtToken);
      expect(result.id).toBe(EXISTING_TOKEN_ID);
      expect(result.accessToken).not.toBeNull();
      expect(result.refreshToken).not.toBeNull();
      expect(result.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
    });
  });

  it('user가 처음으로 로그인 요청한 경우, 새롭게 JwtToken 데이터를 생성한다.', async () => {
    // given
    const userPayload = new UserPayloadDto(9999, EMAIL, NICKNAME);

    // when
    const result = await authService.jwtSign(userPayload);

    // then
    expect(result).toBeInstanceOf(JwtToken);
    expect(result.id).toBe(NEW_TOKEN_ID);
    expect(result.accessToken).not.toBeNull();
    expect(result.refreshToken).not.toBeNull();
    expect(result.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
  });
});
