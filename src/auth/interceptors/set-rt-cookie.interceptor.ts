import { LoginResponseDto } from './../dto/response/login-response.dto';
import { JwtSignResult } from '../types/jwt-sign-result.interface';
// interceptor that set cookie with refresh token
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
export class SetRTCookieInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data: JwtSignResult): LoginResponseDto => {
        const { refreshToken, ...finalData } = data;
        res.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          maxAge: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        });
        return finalData;
      }),
    );
  }
}
