import { ExtendedTile, Room } from './Room';
import { Coordinates, Tile, TileValues } from './Tile';

export interface SocketAnswer {
  error: RoomError | null;
  answer: Answer | null;
  errorMessage?: string;
}

export interface Answer {
  room: Room | null;
  tile: Tile | null;
}

export enum RoomError {
  ROOM_ALREADY_EXIST = 'Room already exists',
  HOST_HAS_CREATED_ROOM = 'Host already has created room which is not closed',
  DATABASE_ERROR = 'Database error',
  ROOM_NOT_FOUND = 'Room not found',
  PLAYER_ALREADY_IN_THE_ROOM = 'Player already in the room',
  NO_STARTING_TILE_FOUND = 'No starting tile found',
  GAME_HAS_ALREADY_STARTED = 'Game has already started',
  PLACEMENT_NOT_CORRECT = 'Tile placement is not correct',
  ROOM_ID_NOT_SPECIFIED = 'Room id not specified',
  MEEPLE_COLOR_NOT_SPECIFIED = 'Meeple color not specified',
}

export interface JoinRoomParams {
  roomID?: string;
  color?: string;
}

export interface JoinRoomPayload extends BasePayload {
  /**
   * Color is passed when player is joining to the room
   * that has not already started.
   */
  color?: string;
}

export interface StartGamePayload extends BasePayload {
  username?: string;
}

export type GetNewTilePayload = BasePayload;

export interface CheckTilePayload extends BasePayload {
  coordinates: Coordinates;
  tileValues: TileValues;
  rotation: number;
}

export interface PlacedTilePayload extends BasePayload {
  extendedTile: ExtendedTile;
}

export interface BasePayload {
  roomID: string;
}

export interface CreateRoomPayload {
  color: string;
}
