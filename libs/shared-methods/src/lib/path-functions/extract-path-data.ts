import { PathData, PathDataMap } from '@carcasonne-mr/shared-interfaces';

export function extractPathData(map: PathDataMap): PathData[] {
  return Array.from(map).map<PathData>((v) => v[1]);
}

export function extractUncompletedPathData(map: PathDataMap): PathData[] {
  return extractPathData(map).filter((pathData) => !pathData.completed);
}
