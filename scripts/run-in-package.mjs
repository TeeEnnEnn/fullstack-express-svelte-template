import { spawnSync } from 'node:child_process';

const pkg = process.argv[2];
const tool = process.argv[3];
const files = process.argv.slice(4);

const flag = tool === 'oxlint' ? '--fix' : '--write';

const result = spawnSync(process.execPath, [`node_modules/.bin/${tool}`, flag, ...files], {
	cwd: pkg,
	stdio: 'inherit',
});

process.exit(result.status ?? 1);