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
    {
      provide: 'JwtTokenRepository',
      useClass: JwtTokenRepositoryImpl,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
