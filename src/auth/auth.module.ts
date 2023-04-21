import { JwtToken } from 'src/auth/entity/jwt-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthService } from './auth.service';
import { createJwtOptions } from './auth.config';
import { JwtTokenRepositoryImpl } from './repository/jwt-token.repository';
import { IJwtTokenRepository } from './repository/jwt-token.repository.interface';
import { TokenService } from './token.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: createJwtOptions,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([JwtToken]),
    UserModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: IJwtTokenRepository,
      useClass: JwtTokenRepositoryImpl,
    },
    TokenService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
