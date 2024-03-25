import { EmptyTile, TileEnvironments } from '@carcasonne-mr/shared-interfaces';

export function checkTilePlacement(
  clickedEmptyTile: EmptyTile,
  tileEnvironments: TileEnvironments
): boolean {
  let checker = true;

  for (const [key, value] of Object.entries(clickedEmptyTile)) {
    switch (key) {
      case 'bottom':
        checker = value === tileEnvironments.bottom;
        break;
      case 'top':
        checker = value === tileEnvironments.top;
        break;
      case 'right':
        checker = value === tileEnvironments.right;
        break;
      case 'left':
        checker = value === tileEnvironments.left;
        break;
    }
    if (!checker) break;
  }
  return checker;
}
