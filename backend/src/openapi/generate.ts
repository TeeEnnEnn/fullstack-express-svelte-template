import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildOpenApiDocument } from './document.js';

import '../routes/health.js';
import '../routes/me.js';
import '../routes/items.js';

const document = buildOpenApiDocument();

const output = resolve(dirname(fileURLToPath(import.meta.url)), '../../openapi.json');
writeFileSync(output, JSON.stringify(document, null, 2) + '\n');
console.log(`OpenAPI spec written to ${output}`);
