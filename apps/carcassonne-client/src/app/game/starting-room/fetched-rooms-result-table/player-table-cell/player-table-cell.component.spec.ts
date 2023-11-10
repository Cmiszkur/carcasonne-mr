import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerTableCellComponent } from './player-table-cell.component';

describe('PlayerTableCellComponent', () => {
  let component: PlayerTableCellComponent;
  let fixture: ComponentFixture<PlayerTableCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerTableCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerTableCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
