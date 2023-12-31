import { Room, RoomDocument } from './../schemas/room.schema';
import { FollowerService } from './follower.service';
import { BasicService } from './basic.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TileDocument, Tiles } from '../schemas/tiles.schema';
import {
  BoardMove,
  Paths,
  Player,
  PointCheckingAnswer,
  RoomError,
  SocketAnswer,
  TilesSet,
  Coordinates,
  ExtendedTile,
  PathDataMap,
  Position,
  Tile,
} from '@carcasonne-mr/shared-interfaces';
import { CheckTilesService } from './check-tiles.service';
import * as crypto from 'crypto';
import { PathService } from './path.service';
import { copy } from '@shared-functions';
import { TilesService } from './tiles.service';
import { PointCountingService } from './point-counting.service';

@Injectable()
export class GameService extends BasicService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Tiles.name) private tileModel: Model<TileDocument>,
    private checkTilesService: CheckTilesService,
    private pathService: PathService,
    private tilesService: TilesService,
    private pointCountingService: PointCountingService,
    private followerService: FollowerService
  ) {
    super();
  }

  public async startGame(roomId: string, username: string): Promise<SocketAnswer> {
    const startingTilesSet: TilesSet | null = await this.getStartingTilesSet();
    const startingTile: Tile | null = startingTilesSet?.drawnTile || null;
    const searchedRoom: RoomDocument | null = await this.roomModel.findOne({
      roomId: roomId,
    });
    const allTiles: Tiles[] = startingTilesSet?.allTiles || [];

    if (!searchedRoom) {
      return this.createAnswer(RoomError.ROOM_NOT_FOUND, null);
    }
    if (!startingTile || allTiles.length === 0) {
      return this.createAnswer(
        RoomError.NO_STARTING_TILE_FOUND,
        null,
        'Try starting game again in few seconds.'
      );
    }

    //Updating fields.
    this.drawTileAndUpdate(searchedRoom, username, allTiles);
    const extendedStartingTile: ExtendedTile = this.getExtendedStartingTile(startingTile);
    searchedRoom.board.push(extendedStartingTile);
    searchedRoom.boardMoves.push(this.getStartingBoardMove());
    searchedRoom.paths = this.getDefaultPaths(extendedStartingTile);
    searchedRoom.gameStarted = true;

    //Saving modified room and returns answer.
    return this.saveRoom(searchedRoom);
  }

  /**
   * Places an ExtendedTile on the game board for the specified user and room, performs several checks before placing the tile.
   * @param username - The username of the user attempting to place the tile.
   * @param roomID - The ID of the room where the tile will be placed.
   * @param extendedTile - The tile to be placed on the board.
   * @returns The result of the attempted tile placement.
   */
  public async placeTile(
    username: string,
    roomID: string,
    extendedTile: ExtendedTile
  ): Promise<SocketAnswer> {
    const searchedRoom: RoomDocument | null = await this.roomModel.findOne({
      roomId: roomID,
    });

    if (!searchedRoom) {
      return this.createAnswer(RoomError.ROOM_NOT_FOUND, null);
    }

    const isPlacedTileOk: boolean = await this.checkTilesService.checkTile(
      roomID,
      extendedTile,
      searchedRoom.board
    );

    if (!isPlacedTileOk) {
      return this.createAnswer(RoomError.PLACEMENT_NOT_CORRECT, null);
    }

    //Checks if game is ended
    searchedRoom.gameEnded = searchedRoom.tilesLeft.length === 0;

    // Draw a tile for the next player and update the tilesLeft count
    if (!searchedRoom.gameEnded) {
      const nextPlayer: string = this.chooseNextPlayer(searchedRoom.players, username);
      this.drawTileAndUpdate(searchedRoom, nextPlayer, searchedRoom.tilesLeft);
    } else {
      searchedRoom.lastChosenTile = null;
    }

    // Add the placed tile to the board and record the move in boardMoves
    searchedRoom.board.push(extendedTile);
    searchedRoom.boardMoves.push(this.getBoardMove(extendedTile.coordinates, username));

    // If a pawn is placed on the tile, remove one follower from the player
    if (extendedTile.fallowerDetails) {
      if (!this.followerService.playerHasEnoughFollowers(searchedRoom.players, username)) {
        return this.createAnswer(RoomError.NOT_ENOUGH_FOLLOWERS, null);
      }
      searchedRoom.players = this.followerService.removeFallowerFromPlayer(searchedRoom, username);
    }

    // Check the point scoring for the new tile and update the paths accordingly
    Object.assign(searchedRoom, this.checkPathsAndUpdate(searchedRoom, extendedTile));

    //Updates players points from uncompleted paths when game is ended
    if (searchedRoom.gameEnded) {
      searchedRoom.players = this.pointCountingService.updatePlayersPointsFromPaths(
        searchedRoom.paths,
        searchedRoom.players
      );
    }

    // Updates players points if tile was placed near church and church has been completed
    Object.assign(searchedRoom, this.checkChurchesAndUpdate(searchedRoom, extendedTile));

    // Save the modified room and return an answer indicating success
    return this.saveRoom(searchedRoom);
  }

  private checkChurchesAndUpdate(room: RoomDocument, extendedTile: ExtendedTile): Partial<Room> {
    const board = room.board;
    const gameEnded = room.gameEnded;
    const tilesWithChurches = gameEnded
      ? this.tilesService.getAllTilesWithUncompletedChurches(board)
      : this.tilesService.checkForChurchesAround(board, extendedTile);

    if (!tilesWithChurches.length) return;

    const churchCountingAnswer = this.pointCountingService.updatePlayersPointsFromChurches(
      board,
      tilesWithChurches,
      gameEnded,
      room.players
    );

    return {
      players: churchCountingAnswer.updatedPlayers,
      board: this.followerService.removeFollowersFromTiles(
        board,
        churchCountingAnswer.tilesWithCompletedChurches
      ),
    };
  }

  private checkPathsAndUpdate(room: RoomDocument, extendedTile: ExtendedTile): Partial<Room> {
    const copiedRoom: Room = copy(room.toObject());
    const pointCheckingAnswer: PointCheckingAnswer = this.pathService.checkNewTile(
      copiedRoom,
      extendedTile
    );

    return {
      paths: pointCheckingAnswer.paths,
      players: this.pointCountingService.updatePlayersPointsFromPathData(
        pointCheckingAnswer.recentlyCompletedPaths,
        copiedRoom.players
      ),
      board: this.followerService.clearFollowersFromCompletedPaths(
        pointCheckingAnswer.recentlyCompletedPaths,
        copiedRoom.board
      ),
    };
  }

  /**
   * Draws tile from left tiles and updates field ``lastChosenTile`` and ``tilesLeft``
   * @param room
   * @param username
   * @param tiles
   */
  private drawTileAndUpdate(room: RoomDocument, username: string, tiles: Tiles[]): void {
    const tilesSet: TilesSet = this.drawTile(tiles);
    room.lastChosenTile = tilesSet.drawnTile
      ? { tile: tilesSet.drawnTile, player: username }
      : null;
    room.tilesLeft = tilesSet.allTiles;
  }

  private chooseNextPlayer(players: Player[], currentPlayer: string): string {
    const indexOfCurrentPlayer: number | undefined = players.findIndex(
      (player) => player.username === currentPlayer
    );
    return players[(indexOfCurrentPlayer + 1) % players.length].username;
  }

  private drawTile(providedTilesLeft: Tiles[] | null): TilesSet {
    let tilesLeft: Tiles[] = copy(providedTilesLeft);
    const pickedTileId: string = this.pickRandomTileId(tilesLeft);
    const drawnTile = tilesLeft.find((tiles) => tiles.id === pickedTileId)?.tile || null;
    tilesLeft = this.deletePickedTile(tilesLeft, pickedTileId);
    return { allTiles: tilesLeft, drawnTile };
  }

  private pickRandomTileId(tilesLeft: Tiles[]): string {
    const tilesDispersed: string[] = tilesLeft.flatMap((tiles) => {
      return Array(tiles.numberOfTiles).fill(tiles.id, 0, tiles.numberOfTiles) as string[];
    });
    const randomNumber: number = Math.floor(Math.random() * tilesLeft.length);
    return tilesDispersed[randomNumber];
  }

  private deletePickedTile(tilesLeft: Tiles[], tilesId: string): Tiles[] {
    const indexOfElementToDelete: number = tilesLeft.findIndex((tiles) => tiles.id === tilesId);
    tilesLeft[indexOfElementToDelete].numberOfTiles -= 1;
    if (tilesLeft[indexOfElementToDelete].numberOfTiles === 0) {
      if (tilesLeft.length === 1) {
        return [];
      }
      delete tilesLeft[indexOfElementToDelete];
    }
    return tilesLeft;
  }

  /**
   * Downloads and returns all tiles from database. Sets the starting tile from downloaded tiles.
   * @returns
   */
  private async getStartingTilesSet(): Promise<TilesSet | null> {
    const allTiles: TileDocument[] = await this.tileModel.find({}).lean();
    const indexOfElementToDelete: number = allTiles.findIndex(
      (tiles: TileDocument) => tiles.tile.tileName === 'toRroTB'
    );
    const startingTile: Tile | null = allTiles[indexOfElementToDelete].tile;

    allTiles[indexOfElementToDelete].numberOfTiles -= 1;
    return startingTile ? { allTiles, drawnTile: startingTile } : null;
  }

  private getExtendedStartingTile(startingTile: Tile): ExtendedTile {
    return {
      id: crypto.randomUUID(),
      tile: startingTile,
      coordinates: { x: 0, y: 0 },
      isFollowerPlaced: false,
      rotation: 0,
      tileValuesAfterRotation: startingTile.tileValues,
    };
  }

  private getStartingBoardMove(): BoardMove {
    return this.getBoardMove({ x: 0, y: 0 }, null);
  }

  private getBoardMove(coordinates: Coordinates | null, player: string | null): BoardMove {
    return {
      coordinates: coordinates,
      player: player,
    };
  }

  private getDefaultPaths(tile: ExtendedTile): Paths {
    return {
      cities: this.getDefaultPathDataMap(tile, [Position.RIGHT], true),
      roads: this.getDefaultPathDataMap(tile, [Position.TOP, Position.BOTTOM]),
    };
  }

  private getDefaultPathDataMap(
    tile: ExtendedTile,
    positions: Position[],
    isCities = false
  ): PathDataMap {
    return new Map([
      [
        crypto.randomUUID(),
        {
          pathOwners: [],
          completed: false,
          points: isCities ? 2 : 1,
          countedTiles: new Map([
            [
              tile.id,
              {
                coordinates: tile.coordinates,
                checkedPositions: new Set(positions),
                isPathCompleted: false,
              },
            ],
          ]),
        },
      ],
    ]);
  }
}
