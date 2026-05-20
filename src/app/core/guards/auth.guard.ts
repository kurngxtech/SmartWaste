import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * Prevents unauthenticated access to protected routes.
 *
 * On a hard refresh with no token / expired token, the user is redirected
 * to /login instantly rather than seeing a broken page followed by API 401s.
 *
 * Note: SSR is allowed through (returns true) so the server can render the
 * shell; the real auth check runs client-side after hydration.
 */
export const authGuard: CanActivateFn = () => {
   const router = inject(Router);
   const platformId = inject(PLATFORM_ID);

   // During SSR there is no localStorage — allow through and let the
   // client-side hydration handle the redirect if needed.
   if (!isPlatformBrowser(platformId)) {
      return true;
   }

   const token = localStorage.getItem('accessToken');

   if (token) {
      return true;
   }

   // No token → redirect to login immediately (no HTTP round-trip needed)
   return router.createUrlTree(['/login']);
};
