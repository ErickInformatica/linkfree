import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for Firebase to restore persisted session before deciding
  const user = await auth.waitForAuth();
  if (user) return true;
  return router.createUrlTree(['/admin/login']);
};
