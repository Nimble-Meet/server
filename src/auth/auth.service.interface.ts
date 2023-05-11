import { LocalSignupRequestDto } from './dto/request/local-signup-request.dto';
import { User } from '../user/entities/user.entity';
import { UserPayloadDto } from './dto/user-payload.dto';
import { JwtToken } from './entity/jwt-token.entity';

export interface IAuthService {
  signup(localSignupDto: LocalSignupRequestDto): Promise<User>;

  validateLocalUser(email: string, password: string): Promise<User>;

  jwtSign(userPayload: UserPayloadDto): Promise<JwtToken>;

  rotateRefreshToken(
    prevRefreshToken: string,
    prevAccessToken: string,
  ): Promise<JwtToken>;
}

export const IAuthService = Symbol('IAuthService');