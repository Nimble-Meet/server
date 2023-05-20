import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { AppModule } from '../app.module';
import { OauthProvider } from '../common/enums/oauth-provider.enum';
import { AuthErrorMessage } from './auth.error-message';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterEach(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  const encryptPasswordInSha256 = (password: string): string =>
    crypto.createHash('sha256').update(password).digest('hex');

  describe('/api/auth/signup (POST)', () => {
    it('회원 가입 - 정상 호출', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'user@google.com',
          password: encryptPasswordInSha256('password'),
          nickname: 'username',
        })
        .expect(HttpStatus.CREATED)
        .expect({
          email: 'user@google.com',
          nickname: 'username',
          providerType: OauthProvider.LOCAL,
        });
    });

    it('회원 가입 - 이메일 형식 위반 시 BadRequest 에러', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'abcdefg',
          password: encryptPasswordInSha256('password'),
          nickname: 'username',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('회원 가입 - 비밀번호 형식 위반 시 BadRequest 에러', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'user@gmail.com',
          password: 'invalid-password',
          nickname: 'username',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toEqual([
            AuthErrorMessage.NOT_SHA256_ENCRYPTED,
          ]);
        });
    });

    it('회원 가입 - 이미 존재하는 이메일로 가입 시 Conflict 에러', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'user@gmail.com',
          password: encryptPasswordInSha256('password'),
          nickname: 'user1',
        });

      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'user@gmail.com',
          password: encryptPasswordInSha256('password'),
          nickname: 'user2',
        })
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.message).toEqual(
            AuthErrorMessage.EMAIL_ALREADY_EXISTS,
          );
        });
    });

    it('회원 가입 - 이미 존재하는 닉네임으로 가입 시 Conflict 에러', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'user@gmail.com',
          password: encryptPasswordInSha256('password'),
          nickname: 'username',
        });

      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'user2@gmail.com',
          password: encryptPasswordInSha256('password'),
          nickname: 'username',
        })
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.message).toEqual(
            AuthErrorMessage.NICKNAME_ALREADY_EXISTS,
          );
        });
    });
  });

  describe('/api/auth/login/local (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'user@google.com',
          password: encryptPasswordInSha256('password'),
          nickname: 'username',
        });
    });

    it('로컬 로그인 - 정상 호출', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login/local')
        .send({
          email: 'user@google.com',
          password: encryptPasswordInSha256('password'),
        })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.userId).toBeDefined();
          expect(res.body.accessToken).toBeDefined();
        });
    });

    it('로컬 로그인 - 존재하지 않는 이메일인 경우 Unauthorized 에러', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login/local')
        .send({
          email: 'invalid@google.com',
          password: encryptPasswordInSha256('password'),
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toEqual(AuthErrorMessage.LOGIN_FAILED);
        });
    });

    it('로컬 로그인 - 비밀번호가 맞지 않는 경우 Unauthorized 에러', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login/local')
        .send({
          email: 'user@google.com',
          password: encryptPasswordInSha256('invalid-password'),
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toEqual(AuthErrorMessage.LOGIN_FAILED);
        });
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'user@google.com',
          password: encryptPasswordInSha256('password'),
          nickname: 'username',
        });
      await login();
    });

    let accessToken: string;
    let cookie: string[];

    const login = async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login/local')
        .send({
          email: 'user@google.com',
          password: encryptPasswordInSha256('password'),
        });

      if (loginResponse.error) {
        console.error(loginResponse.body);
        throw loginResponse.error;
      }

      accessToken = loginResponse.body.accessToken;
      cookie = loginResponse.get('Set-Cookie');
    };

    it('토큰 재발급 - 정상 호출', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookie)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.get('Set-Cookie')).toBeDefined();
        });
    });

    it('토큰 재발급 - access token 누락', async () => {
      await login();
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookie)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            AuthErrorMessage.ACCESS_TOKEN_DOES_NOT_EXIST,
          );
        });
    });

    it('토큰 재발급 - refresh token 누락', async () => {
      await login();
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            AuthErrorMessage.REFRESH_TOKEN_DOES_NOT_EXIST,
          );
        });
    });

    it('토큰 재발급 - 잘못된 refresh token', async () => {
      await login();
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', ['refresh_token=invalidToken'])
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(AuthErrorMessage.INVALID_REFRESH_TOKEN);
        });
    });

    it('토큰 재발급 - 잘못된 access token', async () => {
      await login();
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookie)
        .set('Authorization', `Bearer invalidToken`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            AuthErrorMessage.INCONSISTENT_ACCESS_TOKEN,
          );
        });
    });
    it('토큰 재발급 - 만료된 refresh token', async () => {
      await login();

      const configService = app.get(ConfigService);
      // 만료 시간이 지난 시점으로 설정
      const mockDateNow = jest
        .spyOn(Date, 'now')
        .mockImplementation(() =>
          new Date(
            new Date().getTime() +
              configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
          ).valueOf(),
        );

      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookie)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(AuthErrorMessage.EXPIRED_REFRESH_TOKEN);
        });

      mockDateNow.mockRestore();
    });
  });

  describe('/api/auth/whoami (GET)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'user@google.com',
          password: encryptPasswordInSha256('password'),
          nickname: 'username',
        });
    });

    let accessToken: string;

    const login = async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login/local')
        .send({
          email: 'user@google.com',
          password: encryptPasswordInSha256('password'),
        });

      if (loginResponse.error) {
        console.error(loginResponse.body);
        throw loginResponse.error;
      }

      accessToken = loginResponse.body.accessToken;
    };

    it('사용자 정보 확인 - 정상 호출', async () => {
      await login();
      await request(app.getHttpServer())
        .get('/api/auth/whoami')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.email).toEqual('user@google.com');
          expect(res.body.nickname).toEqual('username');
          expect(res.body.providerType).toEqual(OauthProvider.LOCAL);
        });
    });

    it('사용자 정보 확인 - access token 누락', async () => {
      await login();
      await request(app.getHttpServer())
        .get('/api/auth/whoami')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('사용자 정보 확인 - 유효하지 않은 access token', async () => {
      await login();
      await request(app.getHttpServer())
        .get('/api/auth/whoami')
        .set('Authorization', `Bearer invalid-token`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
