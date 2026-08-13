import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent(
	"securitySchemes",
	"cookieAuth",
	{
		type: "apiKey",
		in: "cookie",
		name: "better-auth.session_token",
	},
);