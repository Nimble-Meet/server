import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserRepositoryImpl } from './repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserService,
    {
      provide: 'UserRepository',
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [
    {
      provide: 'UserRepository',
      useClass: UserRepositoryImpl,
    },
  ],
})
export class UserModule {}
