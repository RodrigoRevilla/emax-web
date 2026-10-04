import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, input, signal } from '@angular/core';
import { NavLink } from '../../../../core/models/content';

@Component({
  selector: 'app-sticky-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sticky-nav.html',
  styleUrl: './sticky-nav.scss',
})
export class StickyNav {
  readonly nav = input.required<NavLink[]>();
  readonly brandCta = input<string>('Escríbenos');

  readonly visible = signal(false);
  readonly menuAbierto = signal(false);

  constructor(private readonly cdr: ChangeDetectorRef) {}

  @HostListener('window:scroll')
  onScroll(): void {
    const shouldShow = window.scrollY > window.innerHeight * 0.6;
    if (shouldShow !== this.visible()) {
      this.visible.set(shouldShow);
      this.cdr.detectChanges();
    }
  }

  toggleMenu(): void { this.menuAbierto.update((v) => !v); this.cdr.detectChanges(); }
  cerrarMenu(): void { this.menuAbierto.set(false); this.cdr.detectChanges(); }
}