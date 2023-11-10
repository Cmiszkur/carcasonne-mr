import { TestBed } from '@angular/core/testing';

import { JoinRoomResolver } from './join-room.resolver';

describe('JoinRoomResolver', () => {
  let resolver: JoinRoomResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(JoinRoomResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
