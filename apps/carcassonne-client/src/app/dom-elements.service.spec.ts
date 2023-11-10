import { TestBed } from '@angular/core/testing';

import { DomElementsService } from './dom-elements.service';

describe('DomElementsService', () => {
  let service: DomElementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
