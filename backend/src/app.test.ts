import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { signUp, testAgent, testApp, TRUSTED_ORIGIN } from '../tests/helpers.js';

describe('health', () => {
	it('reports ok when the database is reachable', async () => {
		const res = await testApp().get('/api/health');
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ status: 'ok', db: 'ok' });
	});
});

describe('unknown routes', () => {
	it('returns 404 for unknown api routes', async () => {
		const res = await testApp().get('/api/does-not-exist');
		expect(res.status).toBe(404);
		expect(res.body).toEqual({ error: { message: 'Not found' } });
	});
});

describe('authentication', () => {
	const email = 'test@example.com';

	it('signs up and sets a session cookie', async () => {
		const res = await signUp(testAgent(), email);
		expect(res.status).toBe(200);
		expect(res.body.user.email).toBe(email);
		expect(res.headers['set-cookie']).toBeDefined();
	});

	it('rejects a duplicate signup', async () => {
		const agent = testAgent();
		await signUp(agent, email);
		const res = await signUp(agent, email);
		expect(res.status).toBe(422);
	});

	it('signs in with the correct password and returns the session', async () => {
		const agent = testAgent();
		await signUp(agent, email);

		const signIn = await agent.post('/api/auth/sign-in/email').set('Origin', TRUSTED_ORIGIN).send({
			email,
			password: 'password123'
		});
		expect(signIn.status).toBe(200);

		const session = await agent.get('/api/auth/get-session');
		expect(session.status).toBe(200);
		expect(session.body.user.email).toBe(email);
	});

	it('rejects a wrong password', async () => {
		const agent = testAgent();
		await signUp(agent, email);

		const res = await agent.post('/api/auth/sign-in/email').set('Origin', TRUSTED_ORIGIN).send({
			email,
			password: 'wrong-password'
		});
		expect(res.status).toBe(401);
	});

	it('rejects requests from an untrusted origin once authenticated', async () => {
		const agent = testAgent();
		await signUp(agent, email);

		const res = await agent
			.post('/api/auth/sign-in/email')
			.set('Origin', 'http://evil.example.com')
			.send({ email, password: 'password123' });
		expect(res.status).toBe(403);
	});
});

describe('me', () => {
	it('returns the current user when authenticated', async () => {
		const agent = testAgent();
		const email = 'me@example.com';
		await signUp(agent, email);

		const res = await agent.get('/api/me');
		expect(res.status).toBe(200);
		expect(res.body.user.email).toBe(email);
	});

	it('rejects unauthenticated requests', async () => {
		const res = await request(createApp()).get('/api/me');
		expect(res.status).toBe(401);
	});
});
