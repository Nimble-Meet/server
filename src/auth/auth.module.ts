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
import { User } from 'src/user/entities/user.entity';
import { JwtTokenRepository } from './jwt-token.repository';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: createJwtOptions,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([JwtToken, User]),
    UserModule,
  ],
  providers: [AuthService, LocalStrategy, JwtTokenRepository],
  exports: [AuthService],
})
export class AuthModule {}
