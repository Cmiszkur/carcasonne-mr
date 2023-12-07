import { TileService } from './tile/services/tile.service';
import { ConfirmationButtonData } from '@carcassonne-client/src/app/game/models/confirmationButtonData';
import { TileEnvironments } from './../../models/Tile';
import { Emptytile } from '@carcassonne-client/src/app/game/models/emptytile';
import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  Signal,
  ChangeDetectionStrategy,
  signal,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { RoomService } from '../../services/room.service';
import { AuthService } from '../../../user/auth.service';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { BaseComponent } from '@carcassonne-client/src/app/commons/components/base/base.component';
import {
  Coordinates,
  CurrentTile,
  ExtendedTile,
  ExtendedTranslatedTile,
  RoomAbstract,
  TileAndPlayer,
} from '@carcasonne-mr/shared-interfaces';
import { SocketService } from '@carcassonne-client/src/app/commons/services/socket.service';
import { BoardTilesService } from '../../services/board-tiles.service';
import { serializeObj } from '@shared-functions';
import { EmptyTilesService } from './services/empty-tiles.service';
import { BoardService } from './services/board.service';

@Component({
  selector: 'app-playing-room',
  templateUrl: './playing-room.component.html',
  styleUrls: ['./playing-room.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayingRoomComponent
  extends BaseComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  /**
   * Indicates confirmation of tile placement. Based on this variable possible pawn placements are determined.
   */
  public tilePlacementConfirmed = signal<boolean>(false);
  public currentTile: Signal<CurrentTile | null> = this.boardService.currentTile;
  public tiles: Signal<ExtendedTranslatedTile[]> = this.boardService.tiles;
  public currentTileEnvironments: Signal<TileEnvironments> =
    this.emptyTilesService.currentTileEnvironments;
  public emptyTiles: Signal<Emptytile[]> = this.emptyTilesService.emptyTiles;
  public isTilePlacedCorrectly = signal<boolean>(false);
  public username: string | null = this.authService.user?.username || null;
  public clickedEmptyTileColor = signal<{ emptyTileId: string; borderColor: string } | null>(null);
  @ViewChild('board', { read: ElementRef }) private boardDivElRef?: ElementRef;
  @ViewChild('blank', { read: ElementRef }) private blankDivElRef?: ElementRef;
  private previouslyClickedTileCoordinates: string = '';

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private socketService: SocketService,
    private el: ElementRef,
    private boardTileService: BoardTilesService,
    private emptyTilesService: EmptyTilesService,
    private boardService: BoardService,
    private tileService: TileService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFirstTilePosition();
    this.updatePlayingRoom(this.roomService.currentRoomValue);
    this.listenForNewTiles();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.socketService.removeListener('tile_placed_new_tile_distributed');
  }

  public ngAfterViewInit(): void {
    const v = this.boardService.setBoardOffsetYAxis();
    if (v) this.addSpaceYAxisAndUpdateVariables(v);
  }

  public trackByIndex(index: number): number {
    return index;
  }

  /**
   * Cancel choice of tile or pawn placement.
   */
  public cancelChoice(): void {
    this.tilePlacementConfirmed.set(false);
    this.tileService.clearPlacedTile();
  }

  /**
   * Confirms choice of tile or pawn placement. When `data.pawnPlaced` is returned as undefined it means that the player
   * didn't make a choice regarding pawn placement, therefore the app shouldn't send tile to backend.
   */
  public confirmChoice(data: ConfirmationButtonData): void {
    this.tilePlacementConfirmed.set(data.tilePlaced);

    if (this.tilePlacementConfirmed() && data.pawnPlaced !== undefined) {
      this.boardService.sendPlacedTileToServer(!!data.pawnPlaced);
    }
  }

  /**
   * Handles choice of tile placement when empty space (also reffered as empty tile) is clicked.
   * If previously clicked coordinates are the same as the current one, then current tile rotation is changed.
   * Makes translate string that is used to position the tile in DOM, saves empty tile state and updates tile fields.
   * @param clickedEmptyTile - contains coordinates as string and empty tile information.
   */
  public emptyTileSelected(clickedEmptyTile: Emptytile): void {
    if (this.tilePlacementConfirmed()) return;

    const coordinates = clickedEmptyTile.coordinates;

    if (this.previouslyClickedTileCoordinates === serializeObj(coordinates)) {
      this.boardService.rotateCurrentTile();
      this.emptyTilesService.setCurrentTileEnvironments(this.currentTile());
    } else {
      this.boardService.updateCurrentTileCoordinates(coordinates);
    }

    const isTilePlacedCorrectly =
      this.emptyTilesService.checkCurrentTilePlacement(clickedEmptyTile);

    this.setClickedEmptyTileBorderColor(
      clickedEmptyTile.id,
      isTilePlacedCorrectly ? 'green' : 'red'
    );
    this.setTilePlacementRelatedFields(coordinates, isTilePlacedCorrectly);
  }

  private addSpaceYAxisAndUpdateVariables(_v: number): void {
    this.addSpaceYAxis(_v);
    this.boardService.updatedTilesTranslateValue();
    this.emptyTilesService.updatedEmptyTilesTranslateValue();
  }

  private addSpaceYAxis(boardOffset: number): void {
    const boardDivElRef = this.boardDivElRef?.nativeElement;
    const blankDivElRef = this.blankDivElRef?.nativeElement;

    if (boardOffset <= 0 && boardDivElRef && blankDivElRef) {
      const v = -boardOffset + this.boardService.boardOffsetYAxisWithMargin + 20;
      blankDivElRef.style.height = blankDivElRef.offsetHeight + v + 'px';
      boardDivElRef.scrollTo(boardDivElRef.scrollLeft, boardDivElRef.scrollTop + v);
      this.boardService.boardOffsetYAxisWithMargin = boardOffset - 20;
    }
  }

  private setClickedEmptyTileBorderColor(emptyTileId: string, borderColor: string) {
    return this.clickedEmptyTileColor.set({ emptyTileId, borderColor });
  }

  /**
   * Sets current tile.
   * @param tile
   * @private
   */
  private setCurrentTile(lastChosenTile: TileAndPlayer): void {
    const isUsersTurn: boolean = this.username === lastChosenTile.player;
    const tile = lastChosenTile.tile;

    this.boardService.setCurrentTile(tile && isUsersTurn ? tile : null);
    this.emptyTilesService.setCurrentTileEnvironments(this.currentTile());
  }

  private setTiles(tiles: ExtendedTile[]): void {
    this.boardService.setTiles(tiles);
    this.emptyTilesService.setEmptyTiles(tiles);
    this.cancelChoice();
    this.resetTilePlacement();
  }

  /**
   * Listens for changes in the current room. Updating tiles and current tile.
   */
  private listenForNewTiles(): void {
    this.roomService
      .receiveTilePlacedResponse()
      .pipe(
        takeUntil(this.destroyed),
        filter((room): room is RoomAbstract => !!room)
      )
      .subscribe((room) => {
        const v = this.boardService.setBoardOffsetYAxis(room.board);

        if (v) this.addSpaceYAxis(v);

        this.tileService.clearPlacedTile();
        this.updatePlayingRoom(this.roomService.currentRoomValue);
      });
  }

  private updatePlayingRoom(room?: RoomAbstract | null): void {
    const lastChosenTile = room?.lastChosenTile;
    const tiles = room?.board;
    if (tiles) this.setTiles(tiles);
    if (lastChosenTile) this.setCurrentTile(lastChosenTile);
  }

  private initFirstTilePosition(): void {
    const hostWidth = this.el.nativeElement.offsetWidth;
    const hostHeight = this.el.nativeElement.offsetHeight;

    this.boardService.setFirstTilePosition({
      x: Math.ceil(hostWidth / 2) - 56,
      y: Math.ceil(hostHeight / 2) - 56,
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
    isTilePlacedCorrectly = false,
    stringifiedCoordinates: string = JSON.stringify(coordinates)
  ): void {
    this.previouslyClickedTileCoordinates = coordinates ? stringifiedCoordinates : '';
    this.isTilePlacedCorrectly.set(isTilePlacedCorrectly);
    this.boardTileService.changeClickedEmptyTileState(
      coordinates ? [stringifiedCoordinates, isTilePlacedCorrectly] : null
    );
  }
}
