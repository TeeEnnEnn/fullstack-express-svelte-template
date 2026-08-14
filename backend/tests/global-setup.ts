import { Pool } from "pg";

// Creates the app_test database (if missing) so vitest can run against a clean,
// disposable Postgres without a manual setup step.
export default async function globalSetup() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) throw new Error("DATABASE_URL is required for tests");

	const testDbName = new URL(databaseUrl).pathname.slice(1);
	const adminUrl = databaseUrl.replace(/\/[^/]*$/, "/postgres");

	const pool = new Pool({ connectionString: adminUrl });
	const { rowCount } = await pool.query("SELECT 1 FROM pg_database WHERE datname = $1", [testDbName]);
	if (!rowCount) {
		await pool.query(`CREATE DATABASE ${quoteIdent(testDbName)}`);
	}
	await pool.end();
}

function quoteIdent(ident: string) {
	return `"${ident.replace(/"/g, '""')}"`;
}