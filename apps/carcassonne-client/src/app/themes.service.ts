import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemesService {
  private currentThemeSubject = new BehaviorSubject(
    localStorage.getItem('theme') || 'light-theme'
  );
  currentTheme$: Observable<string> = this.currentThemeSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  changeTheme(theme: string) {
    this.currentThemeSubject.next(theme);
  }

  getTheme() {
    return this.currentTheme$;
  }

  loadStyle(styleName: string) {
    const head = this.document.getElementsByTagName('head')[0];
    let themeLink = this.document.getElementById(
      'client-theme'
    ) as HTMLLinkElement;
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
