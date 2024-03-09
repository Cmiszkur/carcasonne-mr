import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-success-svg',
  standalone: true,
  templateUrl: 'success-svg.component.html',
})
export class SuccessSvgComponent {
  @Input() size = '150px';
}
