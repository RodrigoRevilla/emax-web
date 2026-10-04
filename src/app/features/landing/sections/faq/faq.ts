import { ChangeDetectionStrategy, ChangeDetectorRef, Component, input, signal } from '@angular/core';
import { Reveal } from '../../../../shared/directives/reveal';
import { SiteContent } from '../../../../core/models/content';

@Component({
  selector: 'app-faq',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq {
  readonly data = input.required<SiteContent['faq']>();

  // Acordeón: reemplaza faq-btn + classList('active') del prototipo.
  readonly openIndex = signal<number | null>(0);

  constructor(private readonly cdr: ChangeDetectorRef) {}

  toggle(i: number): void {
    this.openIndex.update((cur) => (cur === i ? null : i));
    this.cdr.detectChanges();
  }
}
