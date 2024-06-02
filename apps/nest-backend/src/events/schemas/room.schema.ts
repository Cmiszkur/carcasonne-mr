import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { deserializeObj, serializeObj } from '@shared-functions';
import { Tiles } from './tiles.schema';
import {
  RoomAbstract,
  ExtendedTile,
  BoardMove,
  Paths,
  Player,
  TileAndPlayer,
  EmptyTile,
} from '@carcasonne-mr/shared-interfaces';

export type RoomDocument = Room & Document;

@Schema()
export class Room implements RoomAbstract {
  @Prop({
    type: [
      {
        username: String,
        color: {
          type: String,
          enum: ['green', 'blue', 'yellow', 'red'],
        },
        followers: { type: Number, min: 0, max: 6 },
        state: String,
        points: Number,
      },
    ],
  })
  players: Player[];

  @Prop()
  board: ExtendedTile[];

  @Prop({
    type: [
      {
        player: String || null,
        completedPaths: [String],
        placedAt: Date,
        coordinates: { x: Number, y: Number } || null,
      },
    ],
  })
  boardMoves: BoardMove[];

  @Prop({
    type: {} || null,
  })
  lastChosenTile: TileAndPlayer | null;

  @Prop()
  tilesLeft: Tiles[];

  @Prop()
  gameStarted: boolean;

  @Prop()
  gameEnded: boolean;

  @Prop()
  roomId: string;

  @Prop()
  numberOfPlayers: number;

  @Prop()
  roomHost: string;

  @Prop({ type: Date || null })
  hostLeftDate: Date | null;

  @Prop({
    type: Object,
    set: serializeObj,
    get: deserializeObj,
  })
  paths: Paths;

  @Prop()
  emptyTiles: EmptyTile[];

  constructor(partial: Partial<Room>) {
    Object.assign(this, partial);
  }
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.set('toObject', { getters: true });

RoomSchema.path('players').validate((players: []) => {
  if (players.length > 4) {
    throw new Error('Maximum number of players is 4');
  }
  return true;
});
