import { JwtToken } from 'src/auth/entity/jwt-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthServiceImpl } from './auth.service';
import { createJwtOptions } from './auth.config';
import { JwtTokenRepositoryImpl } from './repository/jwt-token.repository';
import { IJwtTokenRepository } from './repository/jwt-token.repository.interface';
import { TokenService } from './token.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { IAuthService } from './auth.service.interface';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: createJwtOptions,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([JwtToken]),
    UserModule,
  ],
  providers: [
    {
      provide: IAuthService,
      useClass: AuthServiceImpl,
    },
    LocalStrategy,
    GoogleStrategy,
    JwtStrategy,
    {
      provide: IJwtTokenRepository,
      useClass: JwtTokenRepositoryImpl,
    },
    TokenService,
  ],
  exports: [
    {
      provide: IAuthService,
      useClass: AuthServiceImpl,
    },
  ],
})
export class AuthModule {}
