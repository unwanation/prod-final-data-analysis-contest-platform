import type { Routes } from '@angular/router';
import { roleGuard } from '../../shared/guards';

export const adminRoutes: Routes = [
  {
    path: '',
    canMatch: [roleGuard('admin')],
    loadComponent: () =>
      import('./ui/dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    title: 'Админ — NADO',
  },
];
