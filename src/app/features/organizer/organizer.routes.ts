import type { Routes } from '@angular/router';
import { roleGuard } from '../../shared/guards';

export const organizerRoutes: Routes = [
  {
    path: '',
    canMatch: [roleGuard('organizer', 'admin')],
    loadComponent: () =>
      import('./ui/dashboard/organizer-dashboard.component').then(
        (m) => m.OrganizerDashboardComponent
      ),
    title: 'Организатор — NADO',
  },
];
