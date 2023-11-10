import { TestBed } from '@angular/core/testing';

import { PrefetchRoomResolverService } from './prefetch-room-resolver.service';

describe('PrefetchRoomResolverService', () => {
  let service: PrefetchRoomResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrefetchRoomResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
