import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserRepositoryImpl } from './repository/user.repository';
import { IUserRepository } from './repository/user.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserService,
    {
      provide: IUserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [
    {
      provide: IUserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
})
export class UserModule {}
