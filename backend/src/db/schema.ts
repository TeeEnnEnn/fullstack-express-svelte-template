import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	id: uuid().primaryKey(),
});

export const accountsTable = pgTable("accounts", {
	id: uuid().primaryKey(),
});

export const sessionsTable = pgTable("sessions", {
	id: uuid().primaryKey(),
});
