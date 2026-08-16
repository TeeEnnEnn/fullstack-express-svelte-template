import request from 'supertest';
import { createApp } from '../src/app.js';

// The origin the backend is configured to trust (BETTER_AUTH_URL / CORS_ORIGINS
// in vitest.config.ts). Better Auth rejects authed requests from other origins.
export const TRUSTED_ORIGIN = 'http://localhost';

export function testApp() {
	return request(createApp());
}

export type TestAgent = ReturnType<typeof request.agent>;

export function testAgent(): TestAgent {
	return request.agent(createApp());
}

export async function signUp(agent: TestAgent, email: string, password = 'password123') {
	return agent.post('/api/auth/sign-up/email').set('Origin', TRUSTED_ORIGIN).send({
		email,
		password,
		name: 'Test User'
	});
}
