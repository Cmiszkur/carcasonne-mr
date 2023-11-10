export enum Environment {
  ROADS = 'roads',
  CITIES = 'cities',
  FIELD = 'field',
  CHURCH = 'church',
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Emptytile {
  top?: Environment;
  right?: Environment;
  bottom?: Environment;
  left?: Environment;
  position: string;
}
