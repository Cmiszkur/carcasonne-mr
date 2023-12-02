import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseComponent } from '@carcassonne-client/src/app/commons/components/base/base.component';
import { RoomService } from '@carcassonne-client/src/app/game/services/room.service';
import { ExtendedTile, CurrentTile } from '@carcasonne-mr/shared-interfaces';
import { Pawn } from '../../../models/pawn';
import { TileService } from './services/tile.service';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.sass'],
})
export class TileComponent extends BaseComponent implements OnChanges, OnInit {
  /**
   * Extended tile data.
   */
  @Input() public extendedTile: ExtendedTile | CurrentTile | null;
  /**
   * Rotation of tile.
   */
  @Input() public rotation: number;
  /**
   * Translate string, which is used in template to position tile in DOM.
   */
  @Input() public translate: string;
  /**
   * Indicates confirmation of tile placement. Based on this variable possible pawn placements are determined.
   */
  @Input() public isTilePlacementConfirmed: boolean;
  /**
   * Boolean that determines whether this tile is currently placed tile.
   */
  @Input() public isCurrentTile: boolean;
  /**
   * Emits pawn placed on a tile.
   */
  @Output() public placedPawn: EventEmitter<Pawn>;
  /**
   * Pawns corresponding to possible positions on the tile.
   */
  public possiblePawnPlacements = this.tileService.possiblePawnPlacements;

  public pawn = signal<Pawn | null>(null);

  /**
   * Color of pawns of logged in player.
   */
  public loggedPlayerColor: string | null;

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private roomService: RoomService,
    private tileService: TileService
  ) {
    super();
    this.extendedTile = null;
    this.rotation = 0;
    this.translate = '';
    this.isTilePlacementConfirmed = false;
    this.isCurrentTile = false;
    this.loggedPlayerColor = this.roomService.playersValue?.loggedPlayer?.color || null;
    iconRegistry.addSvgIcon(
      'follower',
      sanitizer.bypassSecurityTrustResourceUrl('assets/SVG/follower.svg')
    );
    this.placedPawn = new EventEmitter();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isTilePlacementConfirmed']) {
      if (this.isCurrentTile) this.tileService.fillPossiblePawnPlacements(this.extendedTile);
    }
  }

  ngOnInit() {
    if (this.isCurrentTile) {
      this.tileService.fillPossiblePawnPlacements(this.extendedTile);
    } else {
      this.setPawn();
    }
  }

  public makeRotateTransformString(rotation: number): string {
    return `rotate(${rotation}deg)`;
  }

  public getImageSource(imageName: string) {
    return `../../../assets/PNG/${imageName}.png`;
  }

  /**
   * Marks clicked pawn as selected which colors it in the color of logged player.
   * Emits value to ``board.component``.
   * @param pawn clicked pawn
   */
  public placePawn(pawn: Pawn): void {
    this.tileService.placePawn(pawn);
  }

  private setPawn(): void {
    const fallowerDetails = this.extendedTile?.fallowerDetails;
    this.pawn.set(
      fallowerDetails
        ? this.tileService.generatePawn(
            fallowerDetails.position,
            fallowerDetails.placement,
            this.extendedTile?.tile.hasChurch
          )
        : null
    );
  }
}
