import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ShortenedRoom } from '@carcasonne-mr/shared-interfaces';
import { PlayerOptionsData } from '@carcassonne-client/src/app/game/models/dialogWindowData';

@Component({
  selector: 'app-fetched-rooms-result-table',
  templateUrl: './fetched-rooms-result-table.component.html',
  styleUrls: ['./fetched-rooms-result-table.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FetchedRoomsResultTableComponent implements OnChanges {
  public displayedColumns: string[];
  public dataSource: MatTableDataSource<ShortenedRoom>;
  @Input() public availableRooms: ShortenedRoom[] | null;
  @Output() public selectedRoom: EventEmitter<PlayerOptionsData>;

  constructor() {
    this.displayedColumns = ['select', 'roomId', 'players', 'roomHost', 'numberOfPlayers'];
    this.dataSource = new MatTableDataSource<ShortenedRoom>([]);
    this.availableRooms = null;
    this.selectedRoom = new EventEmitter<PlayerOptionsData>();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['availableRooms']?.currentValue) {
      if (this.availableRooms) {
        this.dataSource = new MatTableDataSource<ShortenedRoom>(this.availableRooms);
      }
    }
  }

  public selectAndEmitRoom(playerOptionsData: PlayerOptionsData): void {
    this.selectedRoom.emit(playerOptionsData);
  }
}
