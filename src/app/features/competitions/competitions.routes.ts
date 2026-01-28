import type { Routes } from '@angular/router';
import { authGuard } from '../../shared/guards';

export const competitionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/list/competitions-list.component').then(
        (m) => m.CompetitionsListComponent
      ),
    title: 'Соревнования — NADO',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./ui/detail/competition-detail.component').then(
        (m) => m.CompetitionDetailComponent
      ),
    title: 'Соревнование — NADO',
  },
  {
    path: ':id/participate',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./ui/participate/competition-participate.component').then(
        (m) => m.CompetitionParticipateComponent
      ),
    title: 'Участие — NADO',
  },
];
