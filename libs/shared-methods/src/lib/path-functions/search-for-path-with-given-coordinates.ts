import { Coordinates, PathData, PathDataMap, Position } from '@carcasonne-mr/shared-interfaces';
import { checkCoordinates } from '../tile-functions';
import { getOppositePositions } from '../tile-functions/getOppositePositions';

export function searchForPathWithGivenCoordinates(
  coordinates: Coordinates,
  pathDataMap: PathDataMap,
  position: Position
): [string, PathData] | null {
  const oppositePosition = getOppositePositions(position);
  return (
    Array.from(pathDataMap).find((array: [string, PathData]) => {
      return Array.from(array[1].countedTiles.values()).find((countedTile) => {
        return (
          checkCoordinates(countedTile.coordinates, coordinates) &&
          oppositePosition &&
          countedTile.checkedPositions.has(oppositePosition)
        );
      });
    }) ?? null
  );
}
