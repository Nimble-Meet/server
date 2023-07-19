import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { User } from './entities/user.entity';
import { UserRepositoryImpl } from './repository/user.repository';
import { IUserRepository } from './repository/user.repository.interface';
import { UserController } from './user.controller';
import { UserServiceImpl } from './user.service';
import { IUserService } from './user.service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: IUserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: IUserService,
      useClass: UserServiceImpl,
    },
  ],
  exports: [
    {
      provide: IUserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  controllers: [UserController],
})
export class UserModule {}
