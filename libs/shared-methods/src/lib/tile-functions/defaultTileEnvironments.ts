import { Environment, TileEnvironments } from '@carcasonne-mr/shared-interfaces';

export function defaultTileEnvironments(): TileEnvironments {
  return {
    top: Environment.FIELD,
    right: Environment.FIELD,
    bottom: Environment.FIELD,
    left: Environment.FIELD,
  };
}
