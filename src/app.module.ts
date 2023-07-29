import { AuthModule } from './auth/auth.module';
import { LoggerModule } from 'nestjs-pino';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { createTypeOrmOptions } from './config/typeorm.config';
import { loggerOptions } from './config/logger.config';
import { MeetModule } from './meet/meet.module';

@Module({
  imports: [
    LoggerModule.forRoot(loggerOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env${
        process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''
      }`,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: createTypeOrmOptions,
      inject: [ConfigService],
    }),
    AuthModule,
    MeetModule,
  ],
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
