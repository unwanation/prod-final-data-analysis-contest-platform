import type { Routes } from '@angular/router';
import { noAuthGuard } from '../../shared/guards';

export const authRoutes: Routes = [
  {
    path: 'login',
    canMatch: [noAuthGuard],
    loadComponent: () =>
      import('./ui/login/login.component').then((m) => m.LoginComponent),
    title: 'Вход — NADO',
  },
  {
    path: 'register',
    canMatch: [noAuthGuard],
    loadComponent: () =>
      import('./ui/register/register.component').then((m) => m.RegisterComponent),
    title: 'Регистрация — NADO',
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
