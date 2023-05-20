import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { encryptPasswordInSha256 } from './auth-e2e.util';
import * as cookieParser from 'cookie-parser';
import { OauthProvider } from '../../src/common/enums/oauth-provider.enum';

describe('/api/auth/whoami (GET)', () => {
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
