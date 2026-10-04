import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Envelope } from '../models/api';
import { Usuario } from '../models/auth';

const TOKEN_KEY = 'emax_token';
const USER_KEY = 'emax_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly sesion = signal<Usuario | null>(this.restaurarUsuario());

  token(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string): Observable<{ ok: boolean; error?: string }> {
    return this.http
      .post<Envelope<any>>(`${environment.apiUrl}/auth/login`, {
        email: email.trim(),
        password,
      })
      .pipe(
        switchMap((resp) => {
          const d = resp?.data ?? {};
          const token = d.token ?? d.accessToken ?? d.jwt;
          if (!token) {
            return of({ ok: false, error: 'Respuesta de login inesperada.' });
          }
          sessionStorage.setItem(TOKEN_KEY, token);

          const userInline = (d.usuario ?? d.user) as Usuario | undefined;
          if (userInline) {
            this.guardarUsuario(userInline);
            return of({ ok: true });
          }
          return this.http.get<Envelope<Usuario>>(`${environment.apiUrl}/auth/me`).pipe(
            map((me) => {
              this.guardarUsuario(me.data);
              return { ok: true };
            }),
            catchError(() => {
              sessionStorage.removeItem(TOKEN_KEY);
              return of({ ok: false, error: 'No se pudo cargar el perfil.' });
            }),
          );
        }),
        catchError((err) => {
          const msg = err?.error?.error?.message ?? 'Correo o contraseña incorrectos.';
          return of({ ok: false, error: msg });
        }),
      );
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.sesion.set(null);
  }

  private guardarUsuario(u: Usuario): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(u));
    this.sesion.set(u);
  }

  private restaurarUsuario(): Usuario | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }
}