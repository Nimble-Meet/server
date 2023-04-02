import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from 'src/user/entities/user.entity';

import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly users = [
    {
      userId: 1,
      username: 'test',
      password: 'test',
    },
  ];

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(localSignupDto: LocalSignupRequestDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(localSignupDto.password, 10);
    const user = await this.userService.create({
      ...localSignupDto,
      password: hashedPassword,
    });
    return user;
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.users.find((user) => user.username === username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async login(user: any): Promise<any> {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
