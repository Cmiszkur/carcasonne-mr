import { Coordinates } from '@carcasonne-mr/shared-interfaces';

export function topCoordinates(coordinates: Coordinates): Coordinates {
  return { x: coordinates.x, y: coordinates.y + 1 };
}

export function rightCoordinates(coordinates: Coordinates): Coordinates {
  return { x: coordinates.x + 1, y: coordinates.y };
}

export function bottomCoordinates(coordinates: Coordinates): Coordinates {
  return { x: coordinates.x, y: coordinates.y - 1 };
}

export function leftCoordinates(coordinates: Coordinates): Coordinates {
  return { x: coordinates.x - 1, y: coordinates.y };
}
