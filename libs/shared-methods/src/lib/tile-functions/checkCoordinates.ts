import { Coordinates } from '@carcasonne-mr/shared-interfaces';

export function checkCoordinates(coordinatesA: Coordinates, coordinatesB: Coordinates): boolean {
  return coordinatesA.x === coordinatesB.x && coordinatesA.y === coordinatesB.y;
}
