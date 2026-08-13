import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	if (!session) {
		res.status(401).json({ message: "Unauthorized" });
		return;
	}
	res.locals.user = session.user;
	next();
}