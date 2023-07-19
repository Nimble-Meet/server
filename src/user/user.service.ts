import { Inject, Injectable } from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';

import { IUserRepository } from 'src/user/repository/user.repository.interface';
import { IUserService } from './user.service.interface';

@Injectable()
export class UserServiceImpl implements IUserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneByEmail(email);
  }
}
