import type { Routes } from '@angular/router';
import { ShellComponent } from './shell';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'competitions', pathMatch: 'full' },
      {
        path: 'auth',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.authRoutes),
      },
      {
        path: 'competitions',
        loadChildren: () =>
          import('./features/competitions/competitions.routes').then(
            (m) => m.competitionsRoutes
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then(
            (m) => m.profileRoutes
          ),
      },
      {
        path: 'organizer',
        loadChildren: () =>
          import('./features/organizer/organizer.routes').then(
            (m) => m.organizerRoutes
          ),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.routes').then((m) => m.adminRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'competitions' },
];
