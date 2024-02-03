import { Inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemesService {
  private _currentTheme = signal(localStorage.getItem('theme') || 'light-theme');
  public currentTheme = this._currentTheme.asReadonly();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  changeTheme(theme: string) {
    this._currentTheme.set(theme);
  }

  getTheme() {
    return this.currentTheme;
  }

  loadStyle(styleName: string) {
    const head = this.document.getElementsByTagName('head')[0];
    const themeLink = this.document.getElementById('client-theme') as HTMLLinkElement;
    const fileName = styleName + '.css';

    if (themeLink) {
      themeLink.href = fileName;
      localStorage.setItem('theme', styleName);
    } else {
      const style = this.document.createElement('link');
      style.id = 'client-theme';
      style.rel = 'stylesheet';
      style.href = `${fileName}`;

      head.appendChild(style);
      localStorage.setItem('theme', styleName);
    }
  }
}
