import { ThemesService } from '../themes.service';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass'],
})
export class ToolbarComponent {
  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    public themeService: ThemesService
  ) {
    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('src/assets/SVG/github-icon.svg')
    );
    iconRegistry.addSvgIcon(
      'moon',
      sanitizer.bypassSecurityTrustResourceUrl('src/assets/SVG/Moon.svg')
    );
    iconRegistry.addSvgIcon(
      'sun',
      sanitizer.bypassSecurityTrustResourceUrl('src/assets/SVG/Sun.svg')
    );
  }

  changeTheme(input: string) {
    this.themeService.loadStyle(input);
    this.themeService.changeTheme(input);
  }
}
