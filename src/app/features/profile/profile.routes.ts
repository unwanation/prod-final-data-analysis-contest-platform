import type { Routes } from '@angular/router';
import { authGuard } from '../../shared/guards';

export const profileRoutes: Routes = [
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./ui/profile.component').then((m) => m.ProfileComponent),
    title: 'Личный кабинет — NADO',
  },
];
