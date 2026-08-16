import { Router } from 'express';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { registry } from '../openapi/registry.js';
import { db } from '../db/index.js';
import { itemsTable } from '../db/items.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/require-auth.js';

const ItemSchema = registry.register(
	'Item',
	z.object({
		id: z.string().openapi({ example: 'abc123' }),
		name: z.string().openapi({ example: 'Groceries' }),
		createdAt: z.string().openapi({ format: 'date-time', example: '2026-08-13T00:00:00.000Z' })
	})
);

const CreateItemBodySchema = registry.register(
	'CreateItemBody',
	z.object({
		name: z.string().min(1).max(200).openapi({ example: 'Groceries' })
	})
);

const ItemListSchema = registry.register(
	'ItemList',
	z.object({
		items: z.array(ItemSchema)
	})
);

const validationError = z.object({
	error: z.object({
		message: z.string(),
		details: z.array(
			z.object({
				path: z.string(),
				message: z.string()
			})
		)
	})
});

registry.registerPath({
	method: 'get',
	path: '/api/items',
	summary: "List the current user's items",
	tags: ['items'],
	security: [{ cookieAuth: [] }],
	responses: {
		200: {
			description: "The current user's items",
			content: { 'application/json': { schema: ItemListSchema } }
		},
		401: {
			description: 'Not authenticated',
			content: { 'application/json': { schema: z.object({ message: z.string() }) } }
		}
	}
});

registry.registerPath({
	method: 'post',
	path: '/api/items',
	summary: 'Create an item for the current user',
	tags: ['items'],
	security: [{ cookieAuth: [] }],
	request: {
		body: {
			content: { 'application/json': { schema: CreateItemBodySchema } }
		}
	},
	responses: {
		201: {
			description: 'The created item',
			content: { 'application/json': { schema: ItemSchema } }
		},
		400: {
			description: 'Invalid body',
			content: { 'application/json': { schema: validationError } }
		},
		401: {
			description: 'Not authenticated',
			content: { 'application/json': { schema: z.object({ message: z.string() }) } }
		}
	}
});

const router = Router();

router.get('/items', requireAuth, async (_req, res) => {
	const userId = res.locals.user!.id;
	const rows = await db
		.select()
		.from(itemsTable)
		.where(eq(itemsTable.userId, userId))
		.orderBy(desc(itemsTable.createdAt));
	res.json({
		items: rows.map((row) => ({
			id: row.id,
			name: row.name,
			createdAt: row.createdAt.toISOString()
		}))
	} satisfies z.infer<typeof ItemListSchema>);
});

router.post('/items', requireAuth, validate({ body: CreateItemBodySchema }), async (req, res) => {
	const userId = res.locals.user!.id;
	const [row] = await db.insert(itemsTable).values({ name: req.body.name, userId }).returning();
	res.status(201).json({
		id: row.id,
		name: row.name,
		createdAt: row.createdAt.toISOString()
	} satisfies z.infer<typeof ItemSchema>);
});

export default router;
