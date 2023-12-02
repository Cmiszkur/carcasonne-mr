import { Coordinates, Position } from '@carcasonne-mr/shared-interfaces';
import {
  bottomCoordinates,
  leftCoordinates,
  rightCoordinates,
  topCoordinates,
} from './coordinates';

export function calculateNearestCoordinates(
  position: Position,
  coordinates: Coordinates
): Coordinates {
  switch (position) {
    case Position.TOP:
      return topCoordinates(coordinates);
    case Position.RIGHT:
      return rightCoordinates(coordinates);
    case Position.BOTTOM:
      return bottomCoordinates(coordinates);
    case Position.LEFT:
      return leftCoordinates(coordinates);
  }
}
