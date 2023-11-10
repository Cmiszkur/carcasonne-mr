import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchedRoomsResultTableComponent } from './fetched-rooms-result-table.component';

describe('FetchedRoomsResultTableComponent', () => {
  let component: FetchedRoomsResultTableComponent;
  let fixture: ComponentFixture<FetchedRoomsResultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FetchedRoomsResultTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FetchedRoomsResultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
