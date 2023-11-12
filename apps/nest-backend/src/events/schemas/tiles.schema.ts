import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Tile, TilesAbstract } from '@carcasonne-mr/shared-interfaces';

export type TileDocument = Tiles & Document;

@Schema()
export class Tiles implements TilesAbstract {
  @Prop()
  id: string;

  @Prop({
    type: {},
  })
  tile: Tile;

  @Prop()
  numberOfTiles: number;

  constructor(partial: Partial<Tiles>) {
    Object.assign(this, partial);
  }
}

export const TilesSchema = SchemaFactory.createForClass(Tiles);
