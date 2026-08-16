import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ZodError } from 'zod';

type ValidationSchemas = {
	body?: ZodType;
	query?: ZodType;
	params?: ZodType;
};

export function validate(schemas: ValidationSchemas) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			if (schemas.params) req.params = schemas.params.parse(req.params) as Request['params'];
			if (schemas.query) req.query = schemas.query.parse(req.query) as Request['query'];
			if (schemas.body) req.body = schemas.body.parse(req.body) as Request['body'];
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				res.status(400).json({
					error: {
						message: 'Invalid request',
						details: error.issues.map((issue) => ({
							path: issue.path.join('.'),
							message: issue.message
						}))
					}
				});
				return;
			}
			next(error);
		}
	};
}
