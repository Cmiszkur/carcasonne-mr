import { AuthService } from './../user/services/auth.service';
import { ThemesService } from '../themes.service';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  public user = this.authService.userObservable;

  constructor(
    public themeService: ThemesService,
    private authService: AuthService,
    private router: Router,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.registerIcons();
    this.checkUser();
  }

  changeTheme(input: string) {
    this.themeService.loadStyle(input);
    this.themeService.changeTheme(input);
  }

  public logout(): void {
    this.authService.logout().subscribe((res) => {
      if (res === null) {
        this.router.navigateByUrl('/');
      }
    });
  }

  private checkUser(): void {
    this.authService.auth().subscribe();
  }

  private registerIcons(): void {
    this.iconRegistry.addSvgIcon(
      'github',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/SVG/github-icon.svg')
    );
    this.iconRegistry.addSvgIcon(
      'moon',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/SVG/Moon.svg')
    );
    this.iconRegistry.addSvgIcon(
      'sun',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/SVG/Sun.svg')
    );
  }
}
