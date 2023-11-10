import { Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BoardTilesService } from '../../../../services/board-tiles.service';

@Component({
  selector: 'app-empty-tiles',
  templateUrl: './empty-tile.component.html',
  styleUrls: ['./empty-tile.component.sass'],
})
export class EmptyTileComponent implements OnChanges, OnInit {
  @Input() translate: string;
  @Input() emptyTileCoordinates: string;
  public isPlacedTileCorrect: boolean | string;
  @HostBinding('style.--border-color')
  private borderColor: string;

  constructor(private boardTileService: BoardTilesService) {
    this.translate = '';
    this.emptyTileCoordinates = '';
    this.isPlacedTileCorrect = 'init';
    this.borderColor = '';
  }

  public ngOnInit() {
    this.listenForClickedEmptyTileState();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.translate) {
    }
  }

  private listenForClickedEmptyTileState() {
    this.boardTileService.clickedEmptyTileState.subscribe(clickedEmptyTileState => {
      if (clickedEmptyTileState) {
        if (this.emptyTileCoordinates === clickedEmptyTileState[0]) {
          clickedEmptyTileState[1] ? (this.borderColor = 'green') : (this.borderColor = 'red');
        } else {
          this.borderColor = 'grey';
        }
      }
    });
  }
}
