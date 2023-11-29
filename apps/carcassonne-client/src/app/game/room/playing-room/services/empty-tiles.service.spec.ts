import { TestBed } from '@angular/core/testing';

import { EmptyTilesService } from './empty-tiles.service';

describe('EmptyTilesService', () => {
  let service: EmptyTilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmptyTilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
