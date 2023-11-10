import { ExtendedTile, Player } from '../../../models/Room';
import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Position, TileEnvironments, TileValues } from '../../../models/Tile';
import { KeyValue } from '@angular/common';
import { Coordinates, Emptytile } from '../../../models/emptytile';
import { BoardTilesService } from '../../../services/board-tiles.service';
import { BaseComponent } from 'src/app/commons/components/base/base.component';
import { Pawn } from 'src/app/game/models/pawn';
import { RoomService } from 'src/app/game/services/room.service';
import { takeUntil } from 'rxjs/operators';
import { SocketService } from 'src/app/commons/services/socket.service';
import { ConfirmationButtonData } from 'src/app/game/models/confirmationButtonData';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.sass'],
})
export class BoardComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public tiles: ExtendedTile[] | null;
  @Input() public currentTile: ExtendedTile | null;
  public emptyTiles: Map<string, Emptytile>;
  public translateValueCurrentTile: string;
  /**
   * Indicates confirmation of tile placement. Based on this variable possible pawn placements are determined.
   */
  public tilePlacementConfirmed: boolean;
  /**
   * Indicates confirmation of tile and pawn placement. Based on this variable tile is send to the server.
   */
  public tileAndPawnPlacementConfirmed: boolean;
  public currentTileEnvironments: TileEnvironments;
  public placedPawn: Pawn | null;
  public isTilePlacedCorrectly: boolean;
  private tilesCoordinates: Set<string>;
  private firstTilePosition: Coordinates;
  private previouslyClickedTileCoordinates: string;

  constructor(
    private el: ElementRef,
    private boardTileService: BoardTilesService,
    private roomService: RoomService,
    private socketService: SocketService
  ) {
    super();
    this.tiles = null;
    this.currentTile = null;
    this.tilesCoordinates = new Set<string>();
    this.emptyTiles = new Map<string, Emptytile>();
    this.firstTilePosition = {} as Coordinates;
    this.translateValueCurrentTile = '';
    this.previouslyClickedTileCoordinates = '';
    this.isTilePlacedCorrectly = false;
    this.tilePlacementConfirmed = false;
    this.tileAndPawnPlacementConfirmed = false;
    this.currentTileEnvironments = this.getDefaultTileEnvironments();
    this.placedPawn = null;
  }

  ngOnInit(): void {
    this.listenForNewTiles();
    this.initFirstTilePosition();
    this.tiles?.forEach(tile => {
      this.placeTilesFromBackendOnBoard(tile);
      this.placeEmptyTileInMap(tile.tile.tileValues, tile.rotation, tile.coordinates);
    });
    this.currentTileEnvironments = this.currentTile?.tile.tileValues
      ? this.tileValuesToTileEnvironments(this.currentTile.tile.tileValues, this.currentTile.rotation)
      : this.getDefaultTileEnvironments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tiles) {
      this.resetConfirmation();
      this.resetTilePlacement();
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.socketService.removeListener('tile_placed_new_tile_distributed');
  }

  /**
   * Cancel choice of tile or pawn placement.
   */
  public cancelChoice(): void {
    this.tilePlacementConfirmed = false;
  }

  /**
   * Confirms choice of tile or pawn placement. When `data.pawnPlaced` is returned as undefined it means that the player
   * didn't make a choice regarding pawn placement, therefore the app shouldn't send tile to backend.
   */
  public confirmChoice(data: ConfirmationButtonData): void {
    this.tilePlacementConfirmed = data.tilePlaced;
    this.tileAndPawnPlacementConfirmed = data.tilePlaced && !!data.pawnPlaced;
    console.log(data);
    if (this.tileAndPawnPlacementConfirmed || (this.tilePlacementConfirmed && data.pawnPlaced === false)) {
      this.sendPlacedTileToServer();
    }
  }

  /**
   * Handles choice of tile placement when empty space (also reffered as empty tile) is clicked.
   * If previously clicked coordinates are the same as the current one, then current tile rotation is changed.
   * Makes translate string that is used to position the tile in DOM, saves empty tile state and updates tile fields.
   * @param clickedEmptyTile - contains coordinates as string and empty tile information.
   */
  public emptyTileSelected(clickedEmptyTile: KeyValue<string, Emptytile>): void {
    if (!this.tilePlacementConfirmed) {
      const stringifiedTileCoordinates: string = clickedEmptyTile.key;
      if (this.previouslyClickedTileCoordinates === stringifiedTileCoordinates) {
        if (this.currentTile) {
          this.currentTile.rotation >= 270 ? (this.currentTile.rotation = 0) : (this.currentTile.rotation += 90);
          this.currentTileEnvironments = this.tileValuesToTileEnvironments(
            this.currentTile.tile.tileValues,
            this.currentTile.rotation
          );
        }
      }

      const coordinates = JSON.parse(stringifiedTileCoordinates) as Coordinates;
      const isTilePlacedCorrectly = this.checkCurrentTilePlacement(clickedEmptyTile.value);

      if (this.currentTile) this.currentTile.coordinates = coordinates;
      this.setTilePlacementRelatedFields(coordinates, isTilePlacedCorrectly, stringifiedTileCoordinates);
    }
  }

  public placeTilesFromBackendOnBoard(tile: ExtendedTile): void {
    this.tilesCoordinates.add(JSON.stringify(tile.coordinates));
  }

  public makeTranslateStringForBackendTiles(tile: ExtendedTile): string {
    if (!tile.coordinates) return ''; //TODO: Pomysleć nad lepsza obsługą błędu.
    if (tile.coordinates.x === 0 && tile.coordinates.y === 0) {
      return `translate(${this.firstTilePosition.x}px, ${this.firstTilePosition.y}px`;
    } else {
      return this.makeTranslateString(tile.coordinates);
    }
  }

  /**
   * Sends placed tile extended format with placed pawn.
   */
  public sendPlacedTileToServer(): void {
    const loggedPlayer: Player | null = this.roomService.playersValue?.loggedPlayer || null;
    if (!this.currentTile || !loggedPlayer) return;
    this.currentTile.isFollowerPlaced = this.tileAndPawnPlacementConfirmed && !!this.placedPawn;
    this.currentTile.fallowerDetails =
      this.tileAndPawnPlacementConfirmed && !!this.placedPawn
        ? {
            placement: this.placedPawn.placement,
            position: this.placedPawn.position,
            playerColor: loggedPlayer.color,
            username: loggedPlayer.username,
          }
        : undefined;
    this.roomService.placeTile(this.currentTile);
  }

  public placeEmptyTileInMap(tileValues: TileValues | null, tileRotation: number, coordinates?: { x: number; y: number }): void {
    this.tiles?.forEach(() => {
      if (!coordinates) coordinates = { x: 0, y: 0 };

      const tileEnvironments = this.tileValuesToTileEnvironments(tileValues, tileRotation);

      const emptyTile = (coordinates: Coordinates, emptyTileKeyPosition: keyof Emptytile, TileKeyValue: keyof TileEnvironments) => {
        const value = this.emptyTiles.get(JSON.stringify(coordinates));
        const object = {
          position: this.makeTranslateString(coordinates),
        } as Emptytile;
        return {
          ...(value || object),
          [emptyTileKeyPosition]: tileEnvironments[TileKeyValue],
        } as Emptytile;
      };

      this.emptyTiles.set(
        JSON.stringify({ x: coordinates.x + 1, y: coordinates.y }),
        emptyTile({ x: coordinates.x + 1, y: coordinates.y }, 'left', 'right')
      );
      this.emptyTiles.set(
        JSON.stringify({ x: coordinates.x - 1, y: coordinates.y }),
        emptyTile({ x: coordinates.x - 1, y: coordinates.y }, 'right', 'left')
      );
      this.emptyTiles.set(
        JSON.stringify({ x: coordinates.x, y: coordinates.y + 1 }),
        emptyTile({ x: coordinates.x, y: coordinates.y + 1 }, 'bottom', 'top')
      );
      this.emptyTiles.set(
        JSON.stringify({ x: coordinates.x, y: coordinates.y - 1 }),
        emptyTile({ x: coordinates.x, y: coordinates.y - 1 }, 'top', 'bottom')
      );

      this.tilesCoordinates.forEach(coordinates => {
        this.emptyTiles.delete(coordinates);
      });
    });
  }

  /**
   * Resets tile placement by reverting some fields to default state.
   */
  private resetTilePlacement(): void {
    this.setTilePlacementRelatedFields();
  }

  /**
   * Sets fields responsible for the tile placement.
   * When coordinates are not passed, method reverts fields value to default state set in constructor.
   * @param coordinates
   * @param isTilePlacedCorrectly
   * @param stringifiedCoordinates
   */
  private setTilePlacementRelatedFields(
    coordinates?: Coordinates,
    isTilePlacedCorrectly: boolean = false,
    stringifiedCoordinates: string = JSON.stringify(coordinates)
  ): void {
    this.previouslyClickedTileCoordinates = coordinates ? stringifiedCoordinates : '';
    this.translateValueCurrentTile = coordinates ? this.makeTranslateString(coordinates) : '';
    this.isTilePlacedCorrectly = isTilePlacedCorrectly;
    this.boardTileService.changeClickedEmptyTileState(coordinates ? [stringifiedCoordinates, isTilePlacedCorrectly] : null);
  }

  /**
   * Resets confirmations of tiles and pawns.
   */
  private resetConfirmation(): void {
    this.cancelChoice();
    this.tileAndPawnPlacementConfirmed = false;
  }

  private initFirstTilePosition(): void {
    const hostWidth = this.el.nativeElement.offsetWidth;
    const hostHeight = this.el.nativeElement.offsetHeight;
    this.firstTilePosition = {
      x: hostWidth / 2 - 56,
      y: hostHeight / 2 - 56,
    };
  }

  private checkCurrentTilePlacement(clickedEmptyTile: Emptytile): boolean {
    if (this.currentTileEnvironments) {
      let checker: boolean = true;

      for (const [key, value] of Object.entries(clickedEmptyTile)) {
        switch (key) {
          case 'bottom':
            checker = value === this.currentTileEnvironments.bottom;
            break;
          case 'top':
            checker = value === this.currentTileEnvironments.top;
            break;
          case 'right':
            checker = value === this.currentTileEnvironments.right;
            break;
          case 'left':
            checker = value === this.currentTileEnvironments.left;
            break;
        }
        if (!checker) break;
      }
      return checker;
    } else {
      return false;
    }
  }

  private tileValuesToTileEnvironments(tileValues: TileValues | null, tileRotation: number): TileEnvironments {
    const tileEnvironments: TileEnvironments = this.getDefaultTileEnvironments();

    const tileEnvironmentsKeys = () => {
      const shiftValue = tileRotation >= 360 ? 0 : tileRotation / 90;
      let tileEnvironmentsKeysArray: string[] = ['top', 'right', 'bottom', 'left'];

      for (let i = 1; i <= shiftValue; i++) {
        let firstElement = tileEnvironmentsKeysArray.shift();
        if (firstElement) tileEnvironmentsKeysArray.push(firstElement);
      }

      return tileEnvironmentsKeysArray;
    };

    for (const [key, value] of Object.entries(tileValues || {})) {
      value.forEach((array: Position[]) =>
        array.forEach(string => {
          switch (string) {
            case 'TOP':
              tileEnvironments[tileEnvironmentsKeys()[0] as keyof TileEnvironments] = key;
              break;
            case 'RIGHT':
              tileEnvironments[tileEnvironmentsKeys()[1] as keyof TileEnvironments] = key;
              break;
            case 'BOTTOM':
              tileEnvironments[tileEnvironmentsKeys()[2] as keyof TileEnvironments] = key;
              break;
            case 'LEFT':
              tileEnvironments[tileEnvironmentsKeys()[3] as keyof TileEnvironments] = key;
              break;
          }
        })
      );
    }

    return tileEnvironments;
  }

  private getDefaultTileEnvironments(): TileEnvironments {
    return {
      top: 'fields',
      right: 'fields',
      bottom: 'fields',
      left: 'fields',
    };
  }

  private makeTranslateString(coordinates: Coordinates): string {
    if (this.firstTilePosition) {
      return `translate(
        ${this.firstTilePosition.x + 112 * coordinates.x}px,
        ${this.firstTilePosition.y - 112 * coordinates.y}px)`;
    } else {
      return '';
    }
  }

  private listenForNewTiles(): void {
    this.roomService.receiveTilePlacedResponse().pipe(takeUntil(this.destroyed)).subscribe();
  }
}
