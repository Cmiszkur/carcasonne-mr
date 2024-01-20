import { Module } from '@nestjs/common';
import { MultipleAuthorizeGuard } from './guards/mutliple-authorize.guard';

@Module({
  providers: [MultipleAuthorizeGuard],
})
export class CoreModule {}
