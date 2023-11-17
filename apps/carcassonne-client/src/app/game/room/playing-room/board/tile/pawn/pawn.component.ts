import { Component, Input } from '@angular/core';
import { ExtendedTile } from '@carcasonne-mr/shared-interfaces';

@Component({
  selector: 'app-pawn',
  templateUrl: './pawn.component.html',
  styleUrls: ['./pawn.component.sass'],
})
export class PawnComponent {
  @Input() extendedTile: ExtendedTile | null;
  @Input() rotation: number;

  constructor() {
    this.extendedTile = null;
    this.rotation = 0;
  }

  // private fillPossiblePawnPlacements(): Pawn[] {
  //   const possiblePawnPlacements: Pawn[] = [];

  //   if (this.extendedTile && this.extendedTile.tile.tileValues) {
  //     const tileValues: Tile['tileValues'] = JSON.parse(JSON.stringify(this.extendedTile.tile.tileValues));
  //     const shiftValue = this.rotation >= 360 ? 0 : this.rotation / 90;
  //     const environmentValues: Position[] = [Position.TOP, Position.RIGHT, Position.BOTTOM, Position.LEFT];

  //     for (const [key, value] of Object.entries(tileValues)) {
  //       value.forEach((values: Position[]) => {
  //         values.forEach((environmentValue, environmentIndex) => {
  //           const environmentValuesIndex = environmentValues.indexOf(environmentValue);
  //           const environmentValuesIndexWithRotation = (environmentValuesIndex + shiftValue) % 4;
  //           values[environmentIndex] = environmentValues[environmentValuesIndexWithRotation];
  //         });

  //         console.log('values', values);

  //         if (values.length >= 2) {
  //           possiblePawnPlacements.push({
  //             transformValue: 'translate(32px, 32px)',
  //             position: key,
  //             direction: values,
  //           });
  //         }

  //         if (values.length === 1) {
  //           switch (values[0]) {
  //             case 'TOP':
  //               possiblePawnPlacements.push({
  //                 transformValue: 'translate(32px, 0)',
  //                 position: key,
  //                 direction: ['TOP'],
  //               });
  //               break;
  //             case 'RIGHT':
  //               possiblePawnPlacements.push({
  //                 transformValue: 'translate(70px, 32px)',
  //                 position: key,
  //                 direction: ['RIGHT'],
  //               });
  //               break;
  //             case 'BOTTOM':
  //               possiblePawnPlacements.push({
  //                 transformValue: 'translate(32px, 70px)',
  //                 position: key,
  //                 direction: ['BOTTOM'],
  //               });
  //               break;
  //             case 'LEFT':
  //               possiblePawnPlacements.push({
  //                 transformValue: 'translate(0, 32px)',
  //                 position: key,
  //                 direction: ['LEFT'],
  //               });
  //               break;
  //           }
  //         }
  //       });
  //     }
  //   }
  //   return possiblePawnPlacements;
  // }
}
