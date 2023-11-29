import { ThemesService } from './themes.service';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private clientsTheme = localStorage.getItem('theme') || 'light-mode';

  constructor(private themesService: ThemesService) {}

  ngOnInit() {
    this.themesService.loadStyle(this.clientsTheme);
  }
}
