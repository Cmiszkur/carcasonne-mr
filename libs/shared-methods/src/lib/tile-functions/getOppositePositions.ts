import { Position } from '@carcasonne-mr/shared-interfaces';

const oppositePositions = new Map<Position, Position>([
  [Position.TOP, Position.BOTTOM],
  [Position.BOTTOM, Position.TOP],
  [Position.LEFT, Position.RIGHT],
  [Position.RIGHT, Position.LEFT],
]);

export function getOppositePositions(position: Position): Position | undefined {
  return oppositePositions.get(position);
}
