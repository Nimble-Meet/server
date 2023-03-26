import { LoggerModule } from 'nestjs-pino';

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { createTypeOrmOptions } from './config/typeorm.config';
import { loggerOptions } from './config/logger.config';

@Module({
  imports: [
    LoggerModule.forRoot(loggerOptions),
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createTypeOrmOptions,
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ValidationPipe).forRoutes('*');
  }
}
