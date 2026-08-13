import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createApp } from "./app.js";
import { db } from "./db/index.js";

const port = Number(process.env.PORT ?? 3001);

async function main() {
	await migrate(db, { migrationsFolder: "./drizzle" });
	const app = createApp();
	app.listen(port, () => {
		console.log(`Backend listening on http://localhost:${port}`);
	});
}

main().catch((error) => {
	console.error("Failed to start backend:", error);
	process.exit(1);
});