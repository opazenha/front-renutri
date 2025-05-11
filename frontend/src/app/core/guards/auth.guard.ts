import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // User is logged in, allow access
  }

  // User is not logged in, redirect to login page
  console.log('AuthGuard: User not logged in, redirecting to /login');
  // Store the attempted URL to redirect back after login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false; // Deny access
};
