import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, computed, input, signal } from '@angular/core';
import { Reveal } from '../../../../shared/directives/reveal';
import { SiteContent } from '../../../../core/models/content';
import { sucursalesStore } from '../../../../core/services/sucursales-store';

@Component({
  selector: 'app-campus',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  templateUrl: './campus.html',
  styleUrl: './campus.scss',
})
export class Campus {
  readonly sedes = sucursalesStore.sedes;
  readonly data = input.required<SiteContent['campus']>();

  readonly openBranch = signal<number | null>(null);
  readonly photoIndex = signal(0);

  readonly branch = computed(() => {
    const i = this.openBranch();
    return i === null ? null : this.data().branches[i];
  });
  readonly photo = computed(() => this.branch()?.photos[this.photoIndex()] ?? null);

  constructor(private readonly cdr: ChangeDetectorRef) {}

  open(i: number): void {
    this.openBranch.set(i);
    this.photoIndex.set(0);
    this.cdr.detectChanges();
  }
  close(): void {
    this.openBranch.set(null);
    this.cdr.detectChanges();
  }

  next(): void {
    const b = this.branch();
    if (!b) return;
    this.photoIndex.update((i) => (i + 1) % b.photos.length);
    this.cdr.detectChanges();
  }
  prev(): void {
    const b = this.branch();
    if (!b) return;
    this.photoIndex.update((i) => (i - 1 + b.photos.length) % b.photos.length);
    this.cdr.detectChanges();
  }
goTo(i: number): void { this.photoIndex.set(i); this.cdr.detectChanges(); }

  onImgError(): void {
    console.warn('Foto no encontrada:', this.photo());
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (this.openBranch() === null) return;
    if (e.key === 'Escape') this.close();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  }
}