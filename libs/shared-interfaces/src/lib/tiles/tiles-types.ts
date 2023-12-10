export interface Coordinates {
  x: number;
  y: number;
}

export enum Position {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
}

export interface TileValues {
  [Environment.ROADS]?: [Position[]];
  [Environment.CITIES]?: [Position[]];
}

export interface TileValuesFlat {
  [Environment.ROADS]: Position[];
  [Environment.CITIES]: Position[];
}

export interface ExtendedTile {
  id: string;
  tile: Tile;
  coordinates: Coordinates;
  isFollowerPlaced: boolean;
  rotation: number;
  fallowerDetails?: FollowerDetails;
  tileValuesAfterRotation: TileValues | null;
}

export type ExtendedTranslatedTile = ExtendedTile & {
  translateValue: TranslateValue | null;
};

export type CurrentTile = Omit<ExtendedTile, 'id' | 'coordinates'> & {
  coordinates: Coordinates | null;
  translateValue: TranslateValue | null;
};

export interface FollowerDetails {
  username: string;
  playerColor: string;
  placement: Environment;
  position: Position[];
}

export enum Environment {
  ROADS = 'roads',
  CITIES = 'cities',
  FIELD = 'field',
  CHURCH = 'church',
}

export interface Tile {
  tileName: string;
  tileValues: TileValues | null;
  extraPoints: boolean;
  hasChurch: boolean;
}

/**
 * Map key is path id.
 */
export type PathDataMap = Map<string, PathData>;

export interface PathData {
  countedTiles: CountedTiles;
  pathOwners: string[];
  points: number;
  completed: boolean;
}

/**
 * Map key is tile id.
 */
export type CountedTiles = Map<string, CountedTile>;

export interface CountedTile {
  isPathCompleted: boolean;
  checkedPositions: Set<Position>;
  coordinates: Coordinates;
}

export interface TranslateValue {
  left: number;
  top: number;
}
