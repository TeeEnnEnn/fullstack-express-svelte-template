import { z } from 'zod';

const schema = z.object({
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	BETTER_AUTH_SECRET: z
		.string()
		.min(32, 'BETTER_AUTH_SECRET is required and must be at least 32 characters'),
	BETTER_AUTH_URL: z
		.string()
		.min(1, 'BETTER_AUTH_URL is required (e.g. http://localhost or https://your-domain.com)'),
	CORS_ORIGINS: z.string().optional(),
	PORT: z.coerce.number().int().positive().default(3001),
	LOG_LEVEL: z.string().optional()
});

export type Env = z.infer<typeof schema>;

export function validateEnv() {
	return schema.safeParse(process.env);
}
