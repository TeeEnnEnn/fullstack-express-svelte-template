import { Router } from "express";
import { z } from "zod";
import { fromNodeHeaders } from "better-auth/node";
import { registry } from "../openapi/registry.js";
import { auth } from "../auth.js";

const user = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().email(),
});
const meOk = z.object({ user });
const unauthorized = z.object({
	message: z.string(),
});

registry.registerPath({
	method: "get",
	path: "/api/me",
	summary: "Get the current user",
	tags: ["auth"],
	responses: {
		200: {
			description: "The authenticated user",
			content: { "application/json": { schema: meOk } },
		},
		401: {
			description: "Not authenticated",
			content: { "application/json": { schema: unauthorized } },
		},
	},
});

const router = Router();

router.get("/me", async (req, res) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	if (!session) {
		res.status(401).json({ message: "Unauthorized" } satisfies z.infer<typeof unauthorized>);
		return;
	}
	const { user: u } = session;
	res.json({ user: { id: u.id, name: u.name, email: u.email } } satisfies z.infer<typeof meOk>);
});

export default router;