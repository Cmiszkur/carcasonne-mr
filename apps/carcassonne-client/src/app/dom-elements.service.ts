import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DomElementsService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  public getClientHeightInPx(): string {
    const clientViewHeight = this.document.documentElement.clientHeight;
    return `${clientViewHeight}px`;
  }

  public getTilesAreaWidth(): number | null {
    const tilesAreaWidth = this.document.getElementById('tiles-area')?.scrollWidth;
    return tilesAreaWidth ? tilesAreaWidth : null;
  }

  public getTilesAreaHeight(): number | null {
    const tilesAreaHeight = this.document.getElementById('tiles-area')?.scrollHeight;
    return tilesAreaHeight ? tilesAreaHeight : null;
  }
}
