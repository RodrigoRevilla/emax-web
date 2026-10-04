import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main style="min-height:100vh;display:grid;place-items:center;font-family:var(--font-body)">
      <div style="text-align:center">
        <h1 style="font-family:var(--font-display);font-size:32px">Panel de administración</h1>
        <p style="color:#666;margin-top:8px">Fase 2 — login, edición de contenido y roles/permisos.</p>
      </div>
    </main>
  `,
})
export class Admin {}
