import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry.js';

export function buildOpenApiDocument() {
	const generator = new OpenApiGeneratorV3(registry.definitions);
	return generator.generateDocument({
		openapi: '3.0.0',
		info: {
			title: 'Full Stack Svelte Template API',
			version: '0.1.0'
		},
		servers: [{ url: '/' }]
	});
}
