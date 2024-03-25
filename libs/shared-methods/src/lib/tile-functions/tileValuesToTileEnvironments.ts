import {
  Environment,
  Position,
  TileEnvironments,
  TileValues,
} from '@carcasonne-mr/shared-interfaces';
import { defaultTileEnvironments, TileValuesAfterRotation } from '@shared-functions';

export function tileValuesToTileEnvironments(
  tileValues: TileValues | null,
  tileRotation: number
): TileEnvironments {
  const tileEnvironments: TileEnvironments = defaultTileEnvironments();

  const tileValuesAfterRotation = TileValuesAfterRotation(tileValues, tileRotation);

  if (!tileValuesAfterRotation) {
    return tileEnvironments;
  }

  for (const [environment, positions] of Object.entries(tileValuesAfterRotation) as [
    Environment,
    [Position[]]
  ][]) {
    positions.flat().forEach((position) => {
      switch (position) {
        case 'TOP':
          tileEnvironments.top = environment;
          break;
        case 'RIGHT':
          tileEnvironments.right = environment;
          break;
        case 'BOTTOM':
          tileEnvironments.bottom = environment;
          break;
        case 'LEFT':
          tileEnvironments.left = environment;
          break;
      }
    });
  }

  return tileEnvironments;
}
