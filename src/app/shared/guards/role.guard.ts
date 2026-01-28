import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthFacade } from '../data-access';
import type { UserRole } from '../models';

export function roleGuard(...allowedRoles: UserRole[]): CanMatchFn {
  return () => {
    const auth = inject(AuthFacade);
    const router = inject(Router);

    const currentRole = auth.role();
    if (currentRole && allowedRoles.includes(currentRole)) {
      return true;
    }

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth', 'login']);
    }

    return router.createUrlTree(['/competitions']);
  };
}
