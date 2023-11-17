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
