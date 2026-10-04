import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Reveal } from '../../../../shared/directives/reveal';
import { SiteContent } from '../../../../core/models/content';

@Component({
  selector: 'app-certificaciones',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  templateUrl: './certificaciones.html',
  styleUrl: './certificaciones.scss',
})
export class Certificaciones {
  readonly data = input.required<SiteContent['certifications']>();
}
