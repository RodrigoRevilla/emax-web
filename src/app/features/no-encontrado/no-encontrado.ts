import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './no-encontrado.html',
  styleUrl: './no-encontrado.scss',
})
export class NoEncontrado {}