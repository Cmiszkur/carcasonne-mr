import { copy } from '../core-functions/copyObject';
import { Position, TileValues } from '@carcasonne-mr/shared-interfaces';

export function TileValuesAfterRotation(
  tileValues: TileValues | null,
  rotation: number
): TileValues | null {
  if (tileValues === null) {
    return null;
  }

  const copiedTileValues: TileValues = copy(tileValues);
  const shiftValue = rotation >= 360 ? 0 : rotation / 90;
  const positions: Position[] = [Position.TOP, Position.RIGHT, Position.BOTTOM, Position.LEFT];

  for (const value of Object.values(copiedTileValues)) {
    value.forEach((values: Position[]) => {
      values.forEach((environmentValue, index) => {
        const positionIndex = positions.indexOf(environmentValue);
        const positionAfterRotationIndex = (positionIndex + shiftValue) % 4;
        values[index] = positions[positionAfterRotationIndex];
      });
    });
  }

  return copiedTileValues;
}
