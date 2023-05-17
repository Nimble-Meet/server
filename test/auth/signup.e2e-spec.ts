import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { OauthProvider } from '../../src/common/enums/oauth-provider.enum';
import { DataSource } from 'typeorm';
import { AuthErrorMessage } from '../../src/auth/auth.error-message';
import { encryptPasswordInSha256 } from './auth-e2e.util';

describe('/api/auth/signup (POST)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('회원 가입 - 정상 호출', () => {
    return request(app.getHttpServer())
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

  it('회원 가입 - 이메일 형식 위반 시 BadRequest 에러', () => {
    return request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'abcdefg',
        password: encryptPasswordInSha256('password'),
        nickname: 'username',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('회원 가입 - 비밀번호 형식 위반 시 BadRequest 에러', () => {
    return request(app.getHttpServer())
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

  it('회원 가입 - 이미 존재하는 이메일로 가입 시 Conflict 에러', () => {
    request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'user@gmail.com',
        password: encryptPasswordInSha256('password'),
        nickname: 'user1',
      });

    request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'user@gmail.com',
        password: encryptPasswordInSha256('password'),
        nickname: 'user2',
      })
      .expect(HttpStatus.CONFLICT)
      .expect((res) => {
        expect(res.body.message).toEqual(AuthErrorMessage.EMAIL_ALREADY_EXISTS);
      });
  });

  it('회원 가입 - 이미 존재하는 닉네임으로 가입 시 Conflict 에러', () => {
    request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'user@gmail.com',
        password: encryptPasswordInSha256('password'),
        nickname: 'username',
      });

    request(app.getHttpServer())
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
