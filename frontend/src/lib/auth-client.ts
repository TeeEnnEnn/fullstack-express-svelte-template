import { createAuthClient } from 'better-auth/svelte';

// Same-origin in dev (Vite proxy) and prod (Caddy), so no baseURL needed.
export const authClient = createAuthClient();
