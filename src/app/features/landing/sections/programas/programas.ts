import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, input, signal } from '@angular/core';
import { Reveal } from '../../../../shared/directives/reveal';
import { SiteContent } from '../../../../core/models/content';

@Component({
  selector: 'app-programas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  templateUrl: './programas.html',
  styleUrl: './programas.scss',
})
export class Programas {
  readonly data = input.required<SiteContent['programs']>();

  // Tabs de idioma: reemplaza lang-tab/lang-panel + classList del prototipo.
  readonly activeId = signal<string>('en');
  readonly active = computed(() =>
    this.data().items.find((p) => p.id === this.activeId()) ?? this.data().items[0],
  );

  constructor(private readonly cdr: ChangeDetectorRef) {}

  select(id: string): void { this.activeId.set(id); this.cdr.detectChanges(); }
}
