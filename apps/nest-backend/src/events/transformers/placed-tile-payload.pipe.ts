import { PlacedTilePayload } from '@carcasonne-mr/shared-interfaces';
import { Injectable, PipeTransform } from '@nestjs/common';
import { TileValuesAfterRotation } from '@shared-functions';

@Injectable()
export class PlacedTilePayloadPipe implements PipeTransform<PlacedTilePayload> {
  constructor() {}

  transform(value: PlacedTilePayload) {
    const { roomID, extendedTile } = value;
    return {
      roomID,
      extendedTile: {
        ...extendedTile,
        id: crypto.randomUUID(),
        tileValuesAfterRotation: TileValuesAfterRotation(
          extendedTile.tile.tileValues,
          extendedTile.rotation
        ),
      },
    };
  }
}
