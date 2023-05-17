import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { AuthErrorMessage } from '../../src/auth/auth.error-message';
import { encryptPasswordInSha256 } from './auth-e2e.util';

describe('/api/auth/login/local (POST)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    request(app.getHttpServer())
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

  it('로컬 로그인 - 정상 호출', () => {
    request(app.getHttpServer())
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

  it('로컬 로그인 - 존재하지 않는 이메일인 경우 Unauthorized 에러', () => {
    return request(app.getHttpServer())
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

  it('로컬 로그인 - 비밀번호가 맞지 않는 경우 Unauthorized 에러', () => {
    return request(app.getHttpServer())
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
