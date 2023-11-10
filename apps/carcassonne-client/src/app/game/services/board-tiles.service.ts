import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Coordinates } from '../models/emptytile';
import { Tile } from '../models/Tile';

@Injectable({
  providedIn: 'root',
})
export class BoardTilesService {
  private placedTilesCoordinates$: BehaviorSubject<{ coordinates: Coordinates; tileValues: Tile['tileValues'] } | null>;

  private firstTilePosition$: BehaviorSubject<Coordinates | null>;

  /**
   * Stores the coordinates of the last clicked empty tile and a boolean that determines whether the tile was placed correctly.
   */
  private clickedEmptyTileState$: BehaviorSubject<[string, boolean] | null>;

  /**
   * Indicates confirmation of tile placement. Based on this variable possible pawn placements are determined.
   */
  private tilePlacementConfirmed$: BehaviorSubject<boolean>;

  /**
   * Indicates confirmation of tile and pawn placement. Based on this variable tile is send to the server.
   */
  public tileAndPawnPlacementConfirmed$: BehaviorSubject<boolean>;

  constructor() {
    this.placedTilesCoordinates$ = new BehaviorSubject<{ coordinates: Coordinates; tileValues: Tile['tileValues'] } | null>(null);
    this.firstTilePosition$ = new BehaviorSubject<Coordinates | null>(null);
    this.clickedEmptyTileState$ = new BehaviorSubject<[string, boolean] | null>(null);
    this.tilePlacementConfirmed$ = new BehaviorSubject<boolean>(false);
    this.tileAndPawnPlacementConfirmed$ = new BehaviorSubject<boolean>(false);
  }

  /**
   * Getter for placed tile coordinates.
   */
  public get placedTilesCoordinates(): Observable<{ coordinates: Coordinates; tileValues: Tile['tileValues'] } | null> {
    return this.placedTilesCoordinates$.asObservable();
  }

  /**
   * Sets placed tile coordinates.
   */
  public addPlacedTileCoordinates(placedTileCoordinates: { coordinates: Coordinates; tileValues: Tile['tileValues'] }): void {
    this.placedTilesCoordinates$.next(placedTileCoordinates);
  }

  /**
   * Getter for first tile position.
   */
  public get firstTilePosition(): Observable<Coordinates | null> {
    return this.firstTilePosition$.asObservable();
  }

  /**
   * Sets first tile position.
   */
  public addFirstTilePosition(firstTilePostion: Coordinates): void {
    this.firstTilePosition$.next(firstTilePostion);
  }

  /**
   * Getter for clicked empty tile state.
   */
  public get clickedEmptyTileState(): Observable<[string, boolean] | null> {
    return this.clickedEmptyTileState$.asObservable();
  }

  /**
   * Changes clicked empty tile state.
   */
  public changeClickedEmptyTileState(clickedEmptyTile: [string, boolean] | null): void {
    this.clickedEmptyTileState$.next(clickedEmptyTile);
  }

  /**
   * Getter for tile placement confirmation.
   */
  public get tilePlacementConfirmed(): Observable<boolean> {
    return this.tilePlacementConfirmed$.asObservable();
  }

  /**
   * Setter for tile placement confirmation.
   */
  public set changeTilePlacementConfirmed(isConfirmed: boolean) {
    this.tilePlacementConfirmed$.next(isConfirmed);
  }
}
