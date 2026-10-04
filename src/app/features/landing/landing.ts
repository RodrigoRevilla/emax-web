import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ContentService } from '../../core/services/content';
import { StickyNav } from './sections/sticky-nav/sticky-nav';
import { TopBar } from './sections/top-bar/top-bar';
import { Hero } from './sections/hero/hero';
import { Stats } from './sections/stats/stats';
import { Campus } from './sections/campus/campus';
import { Metodo } from './sections/metodo/metodo';
import { Programas } from './sections/programas/programas';
import { Certificaciones } from './sections/certificaciones/certificaciones';
import { Testimonios } from './sections/testimonios/testimonios';
import { Contacto } from './sections/contacto/contacto';
import { Faq } from './sections/faq/faq';
import { Urgencia } from './sections/urgencia/urgencia';

@Component({
  selector: 'app-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TopBar, StickyNav, Hero, Stats, Campus, Metodo, Programas,
    Certificaciones, Testimonios, Contacto, Faq, Urgencia,
  ],
  templateUrl: './landing.html',
})
export class Landing {
  readonly c = computed(() => this.content.content());

  constructor(private readonly content: ContentService) {}
}