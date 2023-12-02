import { Coordinates, PathData, PathDataMap } from '@carcasonne-mr/shared-interfaces';
import { checkCoordinates } from '../tile-functions';

export function searchForPathWithGivenCoordinates(
  coordinates: Coordinates,
  pathDataMap: PathDataMap
): [string, PathData] | null {
  return (
    Array.from(pathDataMap).find((array: [string, PathData]) => {
      return Array.from(array[1].countedTiles.values()).find((countedTile) => {
        return checkCoordinates(countedTile.coordinates, coordinates);
      });
    }) ?? null
  );
}
