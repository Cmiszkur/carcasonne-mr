import { Module } from '@nestjs/common';
import { MultipleAuthorizeGuard } from '@nest-backend/core/guards';

@Module({
  providers: [MultipleAuthorizeGuard],
})
export class CoreModule {}
