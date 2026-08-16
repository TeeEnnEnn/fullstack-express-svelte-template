import { Router } from 'express';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { registry } from '../openapi/registry.js';
import { db } from '../db/index.js';

const healthOk = z.object({
	status: z.literal('ok'),
	db: z.literal('ok')
});
const healthError = z.object({
	status: z.literal('error'),
	db: z.literal('error')
});

registry.registerPath({
	method: 'get',
	path: '/api/health',
	summary: 'Health check',
	tags: ['system'],
	responses: {
		200: {
			description: 'Service and database are healthy',
			content: { 'application/json': { schema: healthOk } }
		},
		503: {
			description: 'Database is unreachable',
			content: { 'application/json': { schema: healthError } }
		}
	}
});

const router = Router();

router.get('/health', async (_req, res) => {
	try {
		await db.execute(sql`select 1`);
		res.json({ status: 'ok', db: 'ok' } satisfies z.infer<typeof healthOk>);
	} catch {
		res.status(503).json({ status: 'error', db: 'error' } satisfies z.infer<typeof healthError>);
	}
});

export default router;
