import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteContent } from '../../../../core/models/content';

@Component({
  selector: 'app-urgencia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './urgencia.html',
  styleUrl: './urgencia.scss',
})
export class Urgencia {
  readonly data = input.required<SiteContent['urgency']>();
}