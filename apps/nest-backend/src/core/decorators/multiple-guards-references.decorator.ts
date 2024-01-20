import { CanActivate, SetMetadata, Type } from '@nestjs/common';

export const MultipleGuardsReferences = (...guards: Type<CanActivate>[]) =>
  SetMetadata('multipleGuardsReferences', guards);
