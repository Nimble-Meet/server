import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, Length } from 'class-validator';

export function IsMeetName() {
  return applyDecorators(IsNotEmpty(), Length(2, 12));
}
