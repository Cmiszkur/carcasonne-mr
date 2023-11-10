import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayingRoomComponent } from './playing-room.component';

describe('WaitingRoomComponent', () => {
  let component: PlayingRoomComponent;
  let fixture: ComponentFixture<PlayingRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayingRoomComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
