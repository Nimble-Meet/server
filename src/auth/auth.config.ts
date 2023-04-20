import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const createJwtOptions = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
  signOptions: {
    expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
  },
});
