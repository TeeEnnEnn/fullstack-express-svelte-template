import createClient from 'openapi-fetch';
import type { paths } from './schema.js';

// The generated schema paths already include "/api", so no extra base path.
// Same-origin in dev (Vite proxy) and prod (Caddy).
export const api = createClient<paths>({
	baseUrl: '',
	credentials: 'include'
});

export type { paths };
