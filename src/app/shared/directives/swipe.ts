import { Directive, HostListener, output } from '@angular/core';

@Directive({
  selector: '[shariSwipe]'
})
export class Swipe {
  private startX = 0;
  private threshold = 60;

  swipe = output<'left' | 'right'>();

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.startX = event.changedTouches[0].screenX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    const endX = event.changedTouches[0].screenX;
    const deltaX = endX - this.startX;

    if (Math.abs(deltaX) < this.threshold)
      return;

    const direction = deltaX > 0 ? 'right' : 'left';
    this.swipe.emit(direction);
  }
}