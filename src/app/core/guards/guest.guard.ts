import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/models/user';

const getHomePathByRole = (role: UserRole | null): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.BOUTIQUE:
      return '/boutique/dashboard';
    case UserRole.ACHETEUR:
      return '/acheteur/dashboard';
    default:
      return '/403';
  }
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl(getHomePathByRole(authService.getRoleFromToken()));
};
