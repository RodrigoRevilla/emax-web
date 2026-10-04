import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-en-construccion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ec">
      <span class="ec-emoji">🚧</span>
      <h2>{{ titulo }}</h2>
      <p>Esta sección estará disponible próximamente.</p>
    </div>
  `,
  styles: [`
    .ec { display: grid; place-items: center; min-height: 60vh; text-align: center; gap: 6px; }
    .ec-emoji { font-size: 46px; }
    .ec h2 { font-family: var(--font-display); font-size: 28px; }
    .ec p { color: rgba(11,11,18,.55); }
  `],
})
export class EnConstruccion {
  readonly titulo: string;
  constructor(route: ActivatedRoute) {
    this.titulo = route.snapshot.data['titulo'] ?? 'Sección';
  }
}