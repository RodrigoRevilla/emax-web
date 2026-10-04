import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Reveal } from '../../../../shared/directives/reveal';
import { SiteContent } from '../../../../core/models/content';

@Component({
  selector: 'app-contacto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss',
})
export class Contacto {
  readonly data = input.required<SiteContent['contact']>();
  readonly waLink = computed(() => `https://wa.me/${this.data().info.whatsapp}`);
}
