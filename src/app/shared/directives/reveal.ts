import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';

/**
 * Reemplaza el IntersectionObserver de fade-in que estaba suelto en el
 * <script> del prototipo. Uso: <section appReveal>...
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class Reveal implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
