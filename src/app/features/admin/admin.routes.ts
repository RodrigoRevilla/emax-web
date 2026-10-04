import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

const ec = () => import('./shared/en-construccion').then((m) => m.EnConstruccion);

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shell/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio',     loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'cursos',     loadComponent: () => import('./cursos/cursos').then((m) => m.CursosAdmin) },
      { path: 'descuentos', loadComponent: () => import('./descuentos/descuentos').then((m) => m.DescuentosAdmin) },
      { path: 'semanas',    loadComponent: () => import('./semanas/semanas').then((m) => m.SemanasAdmin) },
      { path: 'sucursales', loadComponent: () => import('./sucursales/sucursales').then((m) => m.SucursalesAdmin) },
      { path: 'material',   loadComponent: () => import('./material/material').then((m) => m.MaterialAdmin) },
      { path: 'pagos',      loadComponent: () => import('./pagos/pagos-admin').then((m) => m.PagosAdmin) },
      { path: 'citas',      loadComponent: () => import('./citas/citas').then((m) => m.CitasAdmin) },
      { path: 'usuarios',   loadComponent: () => import('./usuarios/usuarios').then((m) => m.Usuarios) },
    ],
  },
];