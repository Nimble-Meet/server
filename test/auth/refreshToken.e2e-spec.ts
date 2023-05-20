import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { encryptPasswordInSha256 } from './auth-e2e.util';
import * as cookieParser from 'cookie-parser';
import { AuthErrorMessage } from '../../src/auth/auth.error-message';
import { ConfigService } from '@nestjs/config';

describe('/api/auth/refresh (POST)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  beforeEach(async () => {
    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'user@google.com',
        password: encryptPasswordInSha256('password'),
        nickname: 'username',
      });
  });

  afterEach(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
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
    await login();
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
