import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, Length, MaxLength } from 'class-validator';

export function IsMeetName() {
  return applyDecorators(IsNotEmpty(), Length(2, 24));
}

export function IsMeetDescription() {
  return applyDecorators(MaxLength(48));
}
