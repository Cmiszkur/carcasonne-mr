import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

export function RateLimiter(ttl: number, limit: number) {
  return applyDecorators(UseGuards(ThrottlerGuard), Throttle({ default: { ttl, limit } }));
}
