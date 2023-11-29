import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileAndPawnConfirmationButtonComponent } from './tile-and-pawn-confirmation-button';

describe('NoPawnConfirmationComponent', () => {
  let component: TileAndPawnConfirmationButtonComponent;
  let fixture: ComponentFixture<TileAndPawnConfirmationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TileAndPawnConfirmationButtonComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TileAndPawnConfirmationButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
