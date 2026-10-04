import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteContent } from '../../../../core/models/content';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements AfterViewInit {
  readonly data = input.required<SiteContent['hero']>();

  @ViewChild('heroVideo') heroVideo?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    const v = this.heroVideo?.nativeElement;
    if (!v) return;

    v.muted = true;
    v.defaultMuted = true;
    const intentar = () => {
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {  });
      }
    };
    intentar();
    v.addEventListener('loadeddata', intentar, { once: true });
    v.addEventListener('canplay', intentar, { once: true });
  }
}