import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Reveal } from '../../../../shared/directives/reveal';
import { Stat } from '../../../../core/models/content';

@Component({
  selector: 'app-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class Stats {
  readonly items = input.required<Stat[]>();
}
