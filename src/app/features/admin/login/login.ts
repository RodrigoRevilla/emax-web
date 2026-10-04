import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <a class="login-back" href="/">← Volver al sitio</a>
        <h1 class="login-logo">e.Max</h1>
        <p class="login-sub">Panel de administración</p>

        <label>
          Correo
          <input type="email" [ngModel]="email()" (ngModelChange)="email.set($event)"
                 (keyup.enter)="entrar()" placeholder="tucorreo@emax.mx" autocomplete="username">
        </label>
        <label>
          Contraseña
          <input type="password" [ngModel]="password()" (ngModelChange)="password.set($event)"
                 (keyup.enter)="entrar()" placeholder="••••••••" autocomplete="current-password">
        </label>

        @if (error(); as e) { <p class="login-error">{{ e }}</p> }

        <button class="login-btn" (click)="entrar()">Entrar</button>

        <div class="login-demo">
          <p>Cuentas de prueba:</p>
          <code>admin&#64;emax.mx / admin123</code>
          <code>maestro&#64;emax.mx / maestro123</code>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px;
      background: linear-gradient(135deg, var(--ink) 0%, var(--navy) 100%); }
    .login-card { width: min(92vw, 380px); background: #fff; border-radius: var(--radius);
      padding: 36px; box-shadow: var(--shadow-md); }
    .login-back { font-size: 13px; color: rgba(11,11,18,.5); }
    .login-back:hover { color: var(--gold); }
    .login-logo { font-family: var(--font-display); font-weight: 800; font-size: 34px; margin-top: 16px; }
    .login-sub { color: rgba(11,11,18,.6); margin-bottom: 24px; }
    .login-card label { display: block; font-size: 13px; font-weight: 600; color: rgba(11,11,18,.7); margin-bottom: 14px; }
    .login-card input { width: 100%; margin-top: 6px; padding: 12px 14px; font: inherit; font-weight: 400;
      border: 1px solid rgba(11,11,18,.16); border-radius: 10px; }
    .login-card input:focus { outline: 2px solid var(--gold); border-color: transparent; }
    .login-error { color: var(--red); font-size: 13px; margin-bottom: 12px; }
    .login-btn { width: 100%; padding: 13px; border-radius: 999px; background: var(--navy);
      color: var(--bone); font-weight: 700; margin-top: 6px; }
    .login-demo { margin-top: 22px; padding-top: 18px; border-top: 1px solid rgba(11,11,18,.1);
      font-size: 12px; color: rgba(11,11,18,.55); }
    .login-demo p { margin-bottom: 6px; }
    .login-demo code { display: block; font-family: var(--font-mono); color: var(--navy); }
  `],
})
export class Login {
  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  entrar(): void {
    this.error.set(null);
    this.auth.login(this.email(), this.password()).subscribe((res) => {
      if (res.ok) {
        this.router.navigate(['/admin']);
      } else {
        this.error.set(res.error ?? 'No se pudo iniciar sesión.');
        this.cdr.detectChanges();
      }
    });
  }
}