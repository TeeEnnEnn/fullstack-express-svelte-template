import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/index.js';
import * as schema from './db/schema.js';

const trustedOrigins = (process.env.CORS_ORIGINS ?? '')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg', schema }),
	emailAndPassword: {
		enabled: true
	},
	// Brute-force protection (enabled in production by default). Stricter
	// limits on the auth endpoints than the general per-IP limit.
	rateLimit: {
		window: 60,
		max: 100,
		customRules: {
			'/sign-in/email': { window: 60, max: 10 },
			'/sign-up/email': { window: 60, max: 5 }
		}
	},
	// The baseURL origin is trusted by default; add frontend origins (dev, other
	// environments) here so Better Auth accepts their Origin header.
	trustedOrigins,
	// Keep the Origin/CSRF check enabled even in test environments. Better Auth
	// otherwise auto-disables it when it detects tests (NODE_ENV=test), which
	// would hide regressions like an untrusted BETTER_AUTH_URL.
	advanced: {
		disableOriginCheck: false
	}
});
