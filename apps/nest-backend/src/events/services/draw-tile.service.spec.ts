import { Test, TestingModule } from '@nestjs/testing';
import { DrawTileService } from './draw-tile.service';
import { EmptyTilesService } from '@nest-backend/src/events/services/empty-tiles.service';
import { EmptyTile, Environment, Position, TilesSet } from '@carcasonne-mr/shared-interfaces';
import { Tiles } from '@nest-backend/src/events/schemas/tiles.schema';

/**
 * * Test case 1: There are two types of tiles left, only one is playable. Method should return playable tile type as drawn
 * * Test case 2: There is one tile left, and it's not playable. Method should return { allTiles: [], drawnTile: null }
 * * Test case 3: There is one tile left, it's playable. Method should return playable tile type as drawn and empty array.
 * * Test case 4: There are two tiles left of the same type, they're playable.
 * Method should return playable tile type as drawn and left one tile in array.
 */
describe('DrawTileService', () => {
  let service: DrawTileService;
  /**
   * Test case 1 - tiles left
   */
  const tilesLeft: Tiles[] = [
    {
      id: '4',
      numberOfTiles: 1,
      tile: {
        tileValues: {
          cities: [[Position.TOP, Position.RIGHT, Position.BOTTOM, Position.LEFT]],
        },
        extraPoints: true,
        hasChurch: false,
        tileName: 'toLTRB',
      },
    },
    {
      id: '5',
      numberOfTiles: 5,
      tile: {
        tileValues: {
          cities: [[Position.TOP]],
        },
        extraPoints: false,
        hasChurch: false,
        tileName: 'toT',
      },
    },
  ];
  /**
   * Test case 2 - tiles left
   */
  const tilesLeft2: Tiles[] = [
    {
      id: '4',
      numberOfTiles: 1,
      tile: {
        tileValues: {
          cities: [[Position.TOP, Position.RIGHT, Position.BOTTOM, Position.LEFT]],
        },
        extraPoints: true,
        hasChurch: false,
        tileName: 'toLTRB',
      },
    },
  ];
  /**
   * Test case 3 - tiles left
   */
  const tilesLeft3: Tiles[] = [
    {
      id: '5',
      numberOfTiles: 1,
      tile: {
        tileValues: {
          cities: [[Position.TOP]],
        },
        extraPoints: false,
        hasChurch: false,
        tileName: 'toT',
      },
    },
  ];
  /**
   * Test case 4 - tiles left
   */
  const tilesLeft4: Tiles[] = [
    {
      id: '5',
      numberOfTiles: 2,
      tile: {
        tileValues: {
          cities: [[Position.TOP]],
        },
        extraPoints: false,
        hasChurch: false,
        tileName: 'toT',
      },
    },
  ];
  /**
   * Test case 1 - expected result
   */
  const expectedResult: TilesSet = {
    allTiles: [
      {
        id: '4',
        numberOfTiles: 1,
        tile: {
          tileValues: {
            cities: [[Position.TOP, Position.RIGHT, Position.BOTTOM, Position.LEFT]],
          },
          extraPoints: true,
          hasChurch: false,
          tileName: 'toLTRB',
        },
      },
      {
        id: '5',
        numberOfTiles: 4,
        tile: {
          tileValues: {
            cities: [[Position.TOP]],
          },
          extraPoints: false,
          hasChurch: false,
          tileName: 'toT',
        },
      },
    ],
    drawnTile: {
      tileValues: {
        cities: [[Position.TOP]],
      },
      extraPoints: false,
      hasChurch: false,
      tileName: 'toT',
    },
  };
  const emptyTiles: EmptyTile[] = [
    {
      coordinates: {
        x: 0,
        y: -1,
      },
      top: Environment.ROADS,
      id: 'efc7-b672-3260-2758',
    },
    {
      coordinates: {
        x: -1,
        y: 0,
      },
      top: Environment.ROADS,
      id: '3beb-a601-ce5d-c947',
    },
    {
      coordinates: {
        x: 0,
        y: 2,
      },
      bottom: Environment.FIELD,
      id: '46ce-e506-9586-85c4',
    },
    {
      coordinates: {
        x: 2,
        y: 0,
      },
      left: Environment.ROADS,
      id: 'b032-7967-d615-4153',
    },
    {
      coordinates: {
        x: 1,
        y: -1,
      },
      top: Environment.FIELD,
      id: '017e-67a8-fbba-ef43',
    },
    {
      coordinates: {
        x: 2,
        y: 1,
      },
      left: Environment.ROADS,
      id: '720f-9197-6d54-af85',
    },
    {
      coordinates: {
        x: 1,
        y: 2,
      },
      bottom: Environment.FIELD,
      id: '16bd-5194-8978-1405',
    },
    {
      coordinates: {
        x: -2,
        y: 1,
      },
      right: Environment.ROADS,
      id: '6da1-b5c2-5fbb-036e',
    },
    {
      coordinates: {
        x: -1,
        y: 2,
      },
      bottom: Environment.ROADS,
      id: '5ec5-559a-73fa-7b29',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DrawTileService, EmptyTilesService],
    }).compile();

    service = module.get<DrawTileService>(DrawTileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Test case 1', () => {
    for (let i = 0; i < 10; i++) {
      const result = service.drawTileAndUpdateLeftTiles(emptyTiles, tilesLeft);
      expect({
        allTiles: result.allTiles.sort((a, b) => (a.id > b.id ? -1 : 1)),
        drawnTile: result.drawnTile,
      }).toEqual({
        allTiles: expectedResult.allTiles.sort((a, b) => (a.id > b.id ? -1 : 1)),
        drawnTile: expectedResult.drawnTile,
      });
    }
  });

  it('Test case 2', () => {
    const result = service.drawTileAndUpdateLeftTiles(emptyTiles, tilesLeft2);
    expect(result).toEqual({ allTiles: [], drawnTile: null });
  });

  it('Test case 3', () => {
    const result = service.drawTileAndUpdateLeftTiles(emptyTiles, tilesLeft3);
    expect(result).toEqual({
      allTiles: [],
      drawnTile: {
        tileValues: {
          cities: [[Position.TOP]],
        },
        extraPoints: false,
        hasChurch: false,
        tileName: 'toT',
      },
    });
  });

  it('Test case 4', () => {
    const result = service.drawTileAndUpdateLeftTiles(emptyTiles, tilesLeft4);
    expect(result).toEqual({
      allTiles: [
        {
          id: '5',
          numberOfTiles: 1,
          tile: {
            tileValues: {
              cities: [[Position.TOP]],
            },
            extraPoints: false,
            hasChurch: false,
            tileName: 'toT',
          },
        },
      ],
      drawnTile: {
        tileValues: {
          cities: [[Position.TOP]],
        },
        extraPoints: false,
        hasChurch: false,
        tileName: 'toT',
      },
    });
  });
});
