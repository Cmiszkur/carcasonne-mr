import { ThemesService } from './themes.service';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(private themesService: ThemesService) {}

  ngOnInit() {
    this.loadCurrentStyle();
  }

  private loadCurrentStyle(): void {
    this.themesService.loadStyle(this.themesService.currentTheme());
  }
}
