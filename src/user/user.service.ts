import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}
}
