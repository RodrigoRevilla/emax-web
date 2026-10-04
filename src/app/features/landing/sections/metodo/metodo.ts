import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Reveal } from '../../../../shared/directives/reveal';
import { SiteContent } from '../../../../core/models/content';

@Component({
  selector: 'app-metodo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  templateUrl: './metodo.html',
  styleUrl: './metodo.scss',
})
export class Metodo {
  readonly data = input.required<SiteContent['method']>();
}
