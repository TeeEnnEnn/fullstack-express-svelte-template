import { defineConfig, devices } from '@playwright/test';

// Shared with e2e/global-setup.ts and the test backend started by webServer.
const TEST_DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/app_test';
const TEST_SECRET = 'test-only-secret-0123456789abcdef0123456789abcdef';

// The global setup (backend/tests/e2e-global-setup.ts) runs in the main process
// and reads DATABASE_URL from the environment.
process.env.DATABASE_URL = TEST_DATABASE_URL;

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	globalSetup: '../backend/tests/e2e-global-setup.ts',
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: [
		{
			// Test backend on the same port the Vite proxy targets. It is always
			// started fresh so it never reuses a dev backend (which would point at
			// the dev database and reject the :5173 origin).
			command: 'npm run serve:test',
			cwd: '../backend',
			url: 'http://localhost:3001/api/health',
			reuseExistingServer: false,
			timeout: 120_000,
			env: {
				...process.env,
				DATABASE_URL: TEST_DATABASE_URL,
				BETTER_AUTH_SECRET: TEST_SECRET,
				BETTER_AUTH_URL: 'http://localhost:5173',
				CORS_ORIGINS: 'http://localhost:5173',
				PORT: '3001'
			}
		},
		{
			// A production build avoids dev-server hydration races. `vite preview`
			// serves the built app and proxies /api to the backend (see vite.config.ts).
			command: 'npm run build && npm run preview -- --port 5173 --strictPort',
			url: 'http://localhost:5173',
			reuseExistingServer: !process.env.CI,
			timeout: 180_000
		}
	]
});
