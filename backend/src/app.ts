import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pino } from 'pino';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { buildOpenApiDocument } from './openapi/document.js';
import healthRouter from './routes/health.js';
import meRouter from './routes/me.js';
import itemsRouter from './routes/items.js';

const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

const httpLogger = pinoHttp({
	logger: pino({
		level: process.env.NODE_ENV === 'test' ? 'silent' : (process.env.LOG_LEVEL ?? 'info')
	})
});

export function createApp() {
	const app = express();

	app.use(httpLogger);
	app.use(
		cors({
			origin: allowedOrigins.length > 0 ? allowedOrigins : true,
			methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
			credentials: true
		})
	);
	// Content-Security-Policy is disabled because Swagger UI serves inline
	// scripts; re-enable it if you remove or self-host the docs UI.
	app.use(helmet({ contentSecurityPolicy: false }));

	// Better Auth must be mounted before the json body parser.
	app.all('/api/auth/{*any}', toNodeHandler(auth));

	app.use(express.json());

	app.use('/api', healthRouter);
	app.use('/api', meRouter);
	app.use('/api', itemsRouter);

	// Swagger UI with the spec generated from the route registry.
	const spec = buildOpenApiDocument();
	app.get('/api/openapi.json', (_req, res) => {
		res.json(spec);
	});
	app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));

	// 404 for unknown API routes.
	app.use('/api', (_req, res) => {
		res.status(404).json({ error: { message: 'Not found' } });
	});

	// Error handler.
	app.use(
		(err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
			req.log.error({ err }, 'Unhandled error');
			res.status(500).json({ error: { message: 'Internal server error' } });
		}
	);

	return app;
}
