import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerOptionsDialogWindowComponent } from './player-options-dialog-window.component';

describe('PlayerOptionsDialogWindowComponent', () => {
  let component: PlayerOptionsDialogWindowComponent;
  let fixture: ComponentFixture<PlayerOptionsDialogWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerOptionsDialogWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerOptionsDialogWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
