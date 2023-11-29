import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoPawnConfirmationDialogWindowComponent } from './no-pawn-confirmation-dialog-window.component';

describe('NoPawnConfirmationDialogWindowComponent', () => {
  let component: NoPawnConfirmationDialogWindowComponent;
  let fixture: ComponentFixture<NoPawnConfirmationDialogWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoPawnConfirmationDialogWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoPawnConfirmationDialogWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
