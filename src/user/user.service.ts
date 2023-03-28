import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateLocalUserDto } from './dto/request/create-local-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createLocalUserDto: CreateLocalUserDto): Promise<User> {
    const user = await this.userRepository.create(createLocalUserDto);
    return this.userRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
    });
  }
}
