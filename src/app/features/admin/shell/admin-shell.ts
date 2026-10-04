import { ChangeDetectionStrategy, Component, Signal, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { Rol, Usuario } from '../../../core/models/auth';

interface MenuItem { label: string; ruta: string; icon: string; roles: Rol[]; }

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell {
  private readonly menu: MenuItem[] = [
    { label: 'Inicio',           ruta: 'inicio',     icon: '🏠', roles: ['admin'] },
    { label: 'Cursos y precios', ruta: 'cursos',     icon: '🎓', roles: ['admin'] },
    { label: 'Descuentos',       ruta: 'descuentos', icon: '🏷️', roles: ['admin'] },
    { label: 'Semanas de descuento', ruta: 'semanas', icon: '🗓️', roles: ['admin'] },
    { label: 'Sucursales',       ruta: 'sucursales', icon: '📍', roles: ['admin'] },
    { label: 'Material digital', ruta: 'material',   icon: '📚', roles: ['admin', 'maestro'] },
    { label: 'Pagos recibidos',  ruta: 'pagos',      icon: '💳', roles: ['admin'] },
    { label: 'Citas',            ruta: 'citas',      icon: '📅', roles: ['admin'] },
    { label: 'Usuarios',         ruta: 'usuarios',   icon: '👥', roles: ['admin'] },
  ];

  readonly sesion: Signal<Usuario | null>;
  readonly items: Signal<MenuItem[]>;
  readonly colapsado = signal(false);

  constructor(private readonly auth: AuthService, private readonly router: Router) {
    this.sesion = this.auth.sesion;
    this.items = computed(() => {
      const rol = this.sesion()?.rol;
      return rol ? this.menu.filter((m) => m.roles.includes(rol)) : [];
    });
  }

  salir(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}