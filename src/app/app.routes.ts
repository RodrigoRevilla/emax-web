import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'pagos',
    loadComponent: () => import('./features/pagos/pagos').then((m) => m.Pagos),
  },
  {
    path: 'comprobante',
    loadComponent: () => import('./features/comprobante/comprobante').then((m) => m.ConsultaComprobante),
  },
  {
    path: 'alumnos',
    loadComponent: () => import('./features/alumnos/alumnos').then((m) => m.Alumnos),
  },
  {
    path: 'agenda',
    loadComponent: () => import('./features/agenda/agenda').then((m) => m.Agenda),
  },
      {
    path: 'legal',
    loadComponent: () => import('./features/legal/legal').then((m) => m.Legal),
  },
  {
    path: '**',
    loadComponent: () => import('./features/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
  },
];