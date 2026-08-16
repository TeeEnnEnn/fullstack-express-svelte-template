import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';

// Shared by the Playwright e2e suite. Lives in the backend package so it can
// use pg/drizzle, and is wired in as `globalSetup` from frontend/playwright.config.ts.
//
// Ensures the test database exists, applies migrations, and wipes data so every
// e2e run starts from a clean database. Runs before (or idempotently after) the
// backend web server starts, since the backend also migrates on boot.
export default async function globalSetup() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) throw new Error('DATABASE_URL is required (set in playwright.config.ts)');

	const testDbName = new URL(databaseUrl).pathname.slice(1);
	const adminUrl = databaseUrl.replace(/\/[^/]*$/, '/postgres');

	const admin = new Pool({ connectionString: adminUrl });
	const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [
		testDbName
	]);
	if (!rowCount) await admin.query(`CREATE DATABASE "${testDbName.replace(/"/g, '""')}"`);
	await admin.end();

	const pool = new Pool({ connectionString: databaseUrl });
	const db = drizzle(pool);
	const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));
	await migrate(db, { migrationsFolder });

	const tables = await db.execute(
		sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '__drizzle_migrations'`
	);
	const tableNames = tables.rows.map((row) => row.tablename);
	if (tableNames.length > 0) {
		const quoted = tableNames.map((name) => `"public"."${name}"`).join(', ');
		await db.execute(sql.raw(`TRUNCATE ${quoted} RESTART IDENTITY CASCADE`));
	}

	await pool.end();
}
