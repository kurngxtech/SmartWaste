import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
   // Public pages — can be pre-rendered as static HTML
   { path: '', renderMode: RenderMode.Prerender },
   { path: 'login', renderMode: RenderMode.Prerender },
   { path: 'signup', renderMode: RenderMode.Prerender },

   // Authenticated pages — must render on the client only.
   // These require a JWT token from localStorage which doesn't exist during SSR,
   // and pre-rendering them causes hydration mismatches (the "double-click" bug).
   { path: 'dashboard', renderMode: RenderMode.Client },
   { path: 'inventory', renderMode: RenderMode.Client },
   { path: 'planner', renderMode: RenderMode.Client },
   { path: 'donations', renderMode: RenderMode.Client },
   { path: 'notifications', renderMode: RenderMode.Client },
   { path: 'appSettings', renderMode: RenderMode.Client },
   { path: 'userDetail', renderMode: RenderMode.Client },

   // Fallback — anything else renders on client
   { path: '**', renderMode: RenderMode.Client }
];
