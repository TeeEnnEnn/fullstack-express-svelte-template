import type { Session, User } from "better-auth";

declare global {
	namespace Express {
		interface Locals {
			user?: User;
			session?: Session;
		}
	}
}

export {};