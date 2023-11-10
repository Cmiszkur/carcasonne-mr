import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartingRoomComponent } from './starting-room.component';

describe('StartingRoomComponent', () => {
  let component: StartingRoomComponent;
  let fixture: ComponentFixture<StartingRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StartingRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StartingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
