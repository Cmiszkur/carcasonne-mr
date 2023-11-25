import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Pawn } from '../../../../models/pawn';
import { BaseComponent } from '@carcassonne-client/src/app/commons/components/base/base.component';
import { RoomService } from '@carcassonne-client/src/app/game/services/room.service';
import {
  ExtendedTile,
  Position,
  TileValues,
  Environment,
  CurrentTile,
} from '@carcasonne-mr/shared-interfaces';

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
  public pawns: Pawn[];

  public pawn: Pawn | null;

  /**
   * Color of pawns of logged in player.
   */
  public loggedPlayerColor: string | null;

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private roomService: RoomService
  ) {
    super();
    this.extendedTile = null;
    this.rotation = 0;
    this.translate = '';
    this.isTilePlacementConfirmed = false;
    this.pawns = [];
    this.pawn = null;
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
      if (this.isCurrentTile) this.pawns = this.fillPossiblePawnPlacements();
    }
  }

  ngOnInit() {
    if (this.isCurrentTile) {
      this.pawns = this.fillPossiblePawnPlacements();
    } else {
      const fallowerDetails = this.extendedTile?.fallowerDetails;
      this.pawn = fallowerDetails
        ? this.generatePawn(
            fallowerDetails.position,
            fallowerDetails.placement,
            this.extendedTile?.tile.hasChurch
          )
        : null;
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
    this.pawns.forEach((p) => (p.selected = false));
    pawn.selected = true;
    this.placedPawn.emit(pawn);
  }

  private fillPossiblePawnPlacements(): Pawn[] {
    const possiblePawnPlacements: Pawn[] = [];

    if (this.extendedTile) {
      if (this.extendedTile.tile.hasChurch) {
        possiblePawnPlacements.push({
          transformValue: 'translate(32px, 32px)',
          placement: Environment.CHURCH,
          position: [],
        });
      }

      const tileValues: TileValues | null = this.extendedTile.tile.tileValues
        ? JSON.parse(JSON.stringify(this.extendedTile.tile.tileValues))
        : null;

      if (tileValues?.roads || tileValues?.cities) {
        const shiftValue = this.rotation >= 360 ? 0 : this.rotation / 90;
        const environmentValues: Position[] = [
          Position.TOP,
          Position.RIGHT,
          Position.BOTTOM,
          Position.LEFT,
        ];

        for (const [key, value] of Object.entries(tileValues) as [Environment, [Position[]]][]) {
          value.forEach((values: Position[]) => {
            values.forEach((environmentValue, environmentIndex) => {
              const environmentValuesIndex = environmentValues.indexOf(environmentValue);
              const environmentValuesIndexWithRotation = (environmentValuesIndex + shiftValue) % 4;
              values[environmentIndex] = environmentValues[environmentValuesIndexWithRotation];
            });

            if (values.length >= 2) {
              possiblePawnPlacements.push({
                transformValue: 'translate(32px, 32px)',
                placement: key,
                position: values,
              });
            }

            if (values.length === 1) {
              switch (values[0]) {
                case 'TOP':
                  possiblePawnPlacements.push({
                    transformValue: 'translate(32px, 0)',
                    placement: key,
                    position: [Position.TOP],
                  });
                  break;
                case 'RIGHT':
                  possiblePawnPlacements.push({
                    transformValue: 'translate(70px, 32px)',
                    placement: key,
                    position: [Position.RIGHT],
                  });
                  break;
                case 'BOTTOM':
                  possiblePawnPlacements.push({
                    transformValue: 'translate(32px, 70px)',
                    placement: key,
                    position: [Position.BOTTOM],
                  });
                  break;
                case 'LEFT':
                  possiblePawnPlacements.push({
                    transformValue: 'translate(0, 32px)',
                    placement: key,
                    position: [Position.LEFT],
                  });
                  break;
              }
            }
          });
        }
      }
    }
    return possiblePawnPlacements;
  }

  private generatePawn(
    values: Position[],
    key: Environment,
    hasChurch: boolean = false
  ): Pawn | null {
    if (!values.length && !hasChurch) {
      return null;
    }

    if (values.length >= 2 || hasChurch) {
      return {
        transformValue: 'translate(32px, 32px)',
        placement: hasChurch ? Environment.CHURCH : key,
        position: hasChurch ? [] : values,
      };
    }

    switch (values[0]) {
      case 'TOP':
        return {
          transformValue: 'translate(32px, 0)',
          placement: key,
          position: [Position.TOP],
        };
      case 'RIGHT':
        return {
          transformValue: 'translate(70px, 32px)',
          placement: key,
          position: [Position.RIGHT],
        };
      case 'BOTTOM':
        return {
          transformValue: 'translate(32px, 70px)',
          placement: key,
          position: [Position.BOTTOM],
        };
      case 'LEFT':
        return {
          transformValue: 'translate(0, 32px)',
          placement: key,
          position: [Position.LEFT],
        };
      default:
        return null;
    }
  }
}
