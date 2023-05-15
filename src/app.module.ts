import { AuthModule } from './auth/auth.module';
import { LoggerModule } from 'nestjs-pino';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { createTypeOrmOptions } from './config/typeorm.config';
import { loggerOptions } from './config/logger.config';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    LoggerModule.forRoot(loggerOptions),
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createTypeOrmOptions,
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}
