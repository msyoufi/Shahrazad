import { ProfileService } from '../../shared/services/profile';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  Component,
  inject,
  signal,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';

@Component({
  selector: 'shari-about',
  imports: [MatProgressSpinner],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements AfterViewInit, OnDestroy {
  profileService = inject(ProfileService);

  @ViewChildren('animateOnScroll') animateElements!: QueryList<ElementRef>;
  private observer?: IntersectionObserver;

  isLoadingCoverImg = signal(true);
  isLoadingProfileImg = signal(true);

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    this.observeElements();
    this.animateElements.changes.subscribe(() => this.observeElements());
  }

  private observeElements() {
    this.animateElements.forEach((el) => {
      if (!el.nativeElement.classList.contains('visible')) {
        this.observer?.observe(el.nativeElement);
      }
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
