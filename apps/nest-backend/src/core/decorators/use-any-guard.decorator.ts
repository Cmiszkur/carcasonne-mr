import { CanActivate, Type, UseGuards, applyDecorators } from '@nestjs/common';
import { MultipleGuardsReferences } from './multiple-guards-references.decorator';
import { MultipleAuthorizeGuard } from '../guards/mutliple-authorize.guard';

export function UseAnyGuard(...guards: Type<CanActivate>[]) {
  return applyDecorators(MultipleGuardsReferences(...guards), UseGuards(MultipleAuthorizeGuard));
}
