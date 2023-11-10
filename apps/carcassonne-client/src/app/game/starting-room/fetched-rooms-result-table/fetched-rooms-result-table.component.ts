import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ShortenedRoom } from '../../models/Room';

@Component({
  selector: 'app-fetched-rooms-result-table',
  templateUrl: './fetched-rooms-result-table.component.html',
  styleUrls: ['./fetched-rooms-result-table.component.sass'],
})
export class FetchedRoomsResultTableComponent implements OnChanges {
  public displayedColumns: string[];
  public selection: SelectionModel<ShortenedRoom>;
  public dataSource: MatTableDataSource<ShortenedRoom>;
  @Input() public availableRooms: ShortenedRoom[] | null;
  @Output() public selectedRoom: EventEmitter<ShortenedRoom>;

  constructor() {
    this.displayedColumns = ['select', 'roomId', 'players', 'roomHost', 'numberOfPlayers'];
    this.dataSource = new MatTableDataSource<ShortenedRoom>([]);
    this.selection = new SelectionModel<ShortenedRoom>(false, []);
    this.availableRooms = null;
    this.selectedRoom = new EventEmitter<ShortenedRoom>();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.availableRooms.currentValue) {
      if (this.availableRooms) {
        this.dataSource = new MatTableDataSource<ShortenedRoom>(this.availableRooms);
      }
    }
  }

  public selectAndEmitRoom(selectedRoom: ShortenedRoom): void {
    this.selection.toggle(selectedRoom);
    this.selectedRoom.emit(selectedRoom);
  }
}
