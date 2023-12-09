import { TilesAbstract } from '../tiles/tiles-abstract';
import { Coordinates, PathData, PathDataMap, Tile } from '../tiles/tiles-types';
import { RoomAbstract } from './room-abstract';

export interface TilesSet {
  allTiles: TilesAbstract[];
  drawnTile: Tile | null;
}

export interface BoardMove {
  player: string | null;
  coordinates: Coordinates | null;
}

export interface Player {
  username: string;
  color: string;
  followers: number;
  state: PlayerState;
  points: number;
}

export enum PlayerState {
  CONNECTED = 'connnected',
  DISCONNECTED = 'disconnnected',
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
  MEEPLE_COLOR_NOT_SPECIFIED = 'Meeple color not specified',
  NOT_ENOUGH_FOLLOWERS = "Player doesn't have enough followers",
}

export interface TileAndPlayer {
  tile: Tile;
  player: string;
}

export interface Paths {
  cities: PathDataMap;
  roads: PathDataMap;
}

export interface PointCheckingAnswer {
  paths: Paths;
  recentlyCompletedPaths: [string, PathData][];
}

export type ShortenedRoom = Pick<
  RoomAbstract,
  'players' | 'numberOfPlayers' | 'roomHost' | 'roomId' | 'gameStarted' | 'gameEnded'
>;

export type RoomReceived = Omit<RoomAbstract, 'paths'> & { paths: string | object };
