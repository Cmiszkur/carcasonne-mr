import { PlacedTilePayload } from '@carcasonne-mr/shared-interfaces';
import { Injectable, PipeTransform } from '@nestjs/common';
import { TilesService } from '../services/tiles.service';

@Injectable()
export class PlacedTilePayloadPipe implements PipeTransform<PlacedTilePayload> {
  constructor(private tilesService: TilesService) {}

  transform(value: PlacedTilePayload) {
    const { roomID, extendedTile } = value;
    console.log(extendedTile, roomID);
    return {
      roomID,
      extendedTile: {
        ...extendedTile,
        id: crypto.randomUUID(),
        tileValuesAfterRotation: this.tilesService.tilesValuesAfterRotation(
          extendedTile.tile.tileValues,
          extendedTile.rotation
        ),
      },
    };
  }
}
