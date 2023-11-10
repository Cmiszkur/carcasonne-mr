import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerOptionsDialogButtonComponent } from './player-options-dialog-button.component';

describe('PlayerOptionsDialogButtonComponent', () => {
  let component: PlayerOptionsDialogButtonComponent;
  let fixture: ComponentFixture<PlayerOptionsDialogButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerOptionsDialogButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerOptionsDialogButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
