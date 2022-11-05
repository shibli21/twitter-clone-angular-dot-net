import { Directive, ElementRef } from '@angular/core';
import mediumZoom from 'medium-zoom';

@Directive({
  selector: '[appMediumZoom]',
})
export class MediumZoomDirective {
  constructor(private el: ElementRef) {
    mediumZoom(el.nativeElement, {
      background: 'rgba(0, 0, 0, 0.9)',
    });
  }
}
