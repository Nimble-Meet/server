// decorator that use @JwtAuthGuard and @ApiBearerAuth('access-token')
import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function NeedLogin() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('isPublic', false),
    ApiBearerAuth('access-token'),
  );
}
