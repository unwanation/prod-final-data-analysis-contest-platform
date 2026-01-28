import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthFacade } from '../data-access';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/auth', 'login']);
};

export const noAuthGuard: CanMatchFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/competitions']);
};
