import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { signUp, testAgent, TRUSTED_ORIGIN } from "../../tests/helpers.js";

describe("items", () => {
	it("rejects unauthenticated requests", async () => {
		const res = await request(createApp()).get("/api/items");
		expect(res.status).toBe(401);
	});

	it("creates and lists items for the signed-in user", async () => {
		const agent = testAgent();
		await signUp(agent, "items@example.com");

		const create = await agent.post("/api/items").set("Origin", TRUSTED_ORIGIN).send({ name: "Groceries" });
		expect(create.status).toBe(201);
		expect(create.body).toMatchObject({ name: "Groceries" });
		expect(create.body.id).toBeTruthy();
		expect(create.body.createdAt).toBeTruthy();

		const list = await agent.get("/api/items");
		expect(list.status).toBe(200);
		expect(list.body.items).toHaveLength(1);
		expect(list.body.items[0]).toMatchObject({ name: "Groceries" });
	});

	it("rejects an empty item name", async () => {
		const agent = testAgent();
		await signUp(agent, "items2@example.com");

		const res = await agent.post("/api/items").set("Origin", TRUSTED_ORIGIN).send({ name: "" });
		expect(res.status).toBe(400);
	});

	it("does not leak items between users", async () => {
		const first = testAgent();
		await signUp(first, "owner@example.com");
		await first.post("/api/items").set("Origin", TRUSTED_ORIGIN).send({ name: "Mine" });
		const own = await first.get("/api/items");
		expect(own.body.items).toHaveLength(1);

		const second = testAgent();
		await signUp(second, "other@example.com");
		const list = await second.get("/api/items");
		expect(list.status).toBe(200);
		expect(list.body.items).toHaveLength(0);
	});
});