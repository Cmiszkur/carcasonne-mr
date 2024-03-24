import { Test, TestingModule } from '@nestjs/testing';
import { EmptyTilesService } from './empty-tiles.service';

describe('EmptyTilesService', () => {
  let service: EmptyTilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmptyTilesService],
    }).compile();

    service = module.get<EmptyTilesService>(EmptyTilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
