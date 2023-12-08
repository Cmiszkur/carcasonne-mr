import { PathDataMap } from '@carcasonne-mr/shared-interfaces';
import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class CustomLoggerService extends ConsoleLogger {
  constructor() {
    super();
  }

  public logPaths(roadsPathDataMap: PathDataMap, citiesPathDataMap: PathDataMap): void {
    roadsPathDataMap.forEach((pathData, pathId) => {
      console.log('roads pathId: ', pathId);
      console.log(' path completed: ', pathData.completed);
      console.log(' path points: ', pathData.points);
      pathData.countedTiles.forEach((countedTile, tileId) => {
        console.log('   tileId: ', tileId);
        console.log('   tile coordinates: ', countedTile.coordinates);
        console.log('   tile checked positions: ', countedTile.checkedPositions);
        console.log('   =============================================');
      });
      console.log('==================================================');
    });

    citiesPathDataMap.forEach((pathData, pathId) => {
      console.log('cities pathId: ', pathId);
      console.log(' path completed: ', pathData.completed);
      console.log(' path points: ', pathData.points);
      pathData.countedTiles.forEach((countedTile, tileId) => {
        console.log('   tileId: ', tileId);
        console.log('   tile coordinates: ', countedTile.coordinates);
        console.log('   tile checked positions: ', countedTile.checkedPositions);
      });
      console.log('==================================================');
    });
  }
}
