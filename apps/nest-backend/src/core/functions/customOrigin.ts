import { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';
import { environment } from '@nest-backend/src/environments/environment';
import { ForbiddenException } from '@nestjs/common';

export const customOrigin: CustomOrigin = (origin, callback) => {
  const corsOrigin = process.env.NX_CLIENT_CORS_ORIGIN;
  console.log('origin', origin, corsOrigin);
  if (corsOrigin === origin || !environment.production) {
    callback(null, true);
  } else {
    callback(new ForbiddenException('Origin not allowed by CORS'));
  }
};
