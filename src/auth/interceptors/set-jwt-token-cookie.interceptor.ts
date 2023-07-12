import { JwtSignResultDto } from './../dto/jwt-sign-result.dto';
import { LoginResponseDto } from './../dto/response/login-response.dto';

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class SetJWTTokenCookieInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((jwtSignResult: JwtSignResultDto): LoginResponseDto => {
        const loginResponse = LoginResponseDto.fromJwtSignResult(jwtSignResult);
        res.cookie('refresh_token', jwtSignResult.refreshToken, {
          httpOnly: true,
          maxAge:
            +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
        });
        res.cookie('access_token', jwtSignResult.accessToken, {
          httpOnly: true,
          maxAge:
            +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') * 1000,
        });
        return loginResponse;
      }),
    );
  }
}
