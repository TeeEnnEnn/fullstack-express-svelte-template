import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './schema.js';

export const itemsTable = pgTable('items', {
	id: text('id')
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	name: text('name').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
