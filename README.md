
![Node Badge](https://img.shields.io/badge/Node.js-026e00?style=flat-square&logo=Node.js&logoColor=white) ![TypeScript Badge](https://img.shields.io/badge/Typescript-235A97?style=flat-square&logo=Typescript&logoColor=white) ![TypeScript Badge](https://img.shields.io/badge/Nest.Js-cc0000?style=flat-square&logo=NestJs&logoColor=white) ![Jest Badge](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=Jest&logoColor=white) ![Docker Badge](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

# Description

Nimble Meet 백엔드 리퍼지토리

# .env
프로젝트 루트 디렉토리에 .env 파일 생성  
테스트 실행 시에는 동일한 형식으로 .env.test 파일 생성
```yml
DATABASE_HOST=<db host>
DATABASE_USER=<db user>
DATABASE_PASSWORD=<db password>
DATABASE_NAME=<db name>

JWT_ACCESS_TOKEN_SECRET=<random secret>
JWT_REFRESH_TOKEN_SECRET=<random secret>
JWT_REFRESH_TOKEN_EXPIRATION_TIME=<expiration time in sec>
JWT_ACCESS_TOKEN_EXPIRATION_TIME=<expiration time in sec>
```

# Running the app

```bash
$ docker-compose up
```

# Test

```bash
# 전체 테스트
$ yarn test

# 테스트 커버리지 확인
$ yarn test:cov

# 단위 테스트
$ yarn test:unit

# e2e 테스트
$ yarn test:e2e

```
