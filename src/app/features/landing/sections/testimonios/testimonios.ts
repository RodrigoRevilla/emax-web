import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, computed, input, signal } from '@angular/core';
import { Reveal } from '../../../../shared/directives/reveal';
import { SiteContent } from '../../../../core/models/content';

@Component({
  selector: 'app-testimonios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  templateUrl: './testimonios.html',
  styleUrl: './testimonios.scss',
})
export class Testimonios implements OnDestroy {
  readonly data = input.required<SiteContent['testimonials']>();

  readonly index = signal(0);
  readonly current = computed(() => this.data().items[this.index()]);

  private timer?: ReturnType<typeof setInterval>;
  private touchX = 0;

  constructor(private readonly cdr: ChangeDetectorRef) {
    this.startAutoplay();
  }

  goTo(i: number): void {
    const n = this.data().items.length;
    this.index.set((i + n) % n);
    this.cdr.detectChanges();
  }
  next(): void { this.goTo(this.index() + 1); }
  prev(): void { this.goTo(this.index() - 1); }

  startAutoplay(): void {
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), 6000);
  }
  stopAutoplay(): void {
    if (this.timer) clearInterval(this.timer);
  }

  onTouchStart(e: TouchEvent): void { this.touchX = e.touches[0].clientX; }
  onTouchEnd(e: TouchEvent): void {
    const dx = e.changedTouches[0].clientX - this.touchX;
    if (Math.abs(dx) > 50) { dx < 0 ? this.next() : this.prev(); }
  }

  ngOnDestroy(): void { this.stopAutoplay(); }
}
