import {
  Coordinates,
  ExtendedTile,
  Tile,
  TileValues,
} from '../tiles/tiles-types';
import { IncomingMessage } from 'http';
import { Socket } from 'socket.io';
import { RoomAbstract, RoomError } from '../room';

export interface SocketAnswer {
  error: RoomError | null;
  answer: Answer | null;
  errorMessage?: string;
}

export interface Answer {
  room: RoomAbstract | null;
  tile: Tile | null;
}

export interface ExtendedSocket extends Socket {
  username: string;
  gameRoomId: string | undefined;
  request: ExtendedIncomingMessage;
}

export interface ExtendedIncomingMessage extends IncomingMessage {
  user: RequestUser;
  isAuthenticated(): boolean;
}

export interface RequestUser {
  name: string;
  email: string;
  username: string;
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

export type LeaveRoomPayload = BasePayload;

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
