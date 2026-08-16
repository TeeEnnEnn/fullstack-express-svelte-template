export default {
	'backend/**/*.{ts,mts,cts,js}': (files) => [
		`node scripts/run-in-package.mjs backend prettier ${files.join(' ')}`,
		`node scripts/run-in-package.mjs backend oxlint ${files.join(' ')}`
	],
	'frontend/**/*.{ts,mts,cts,js}': (files) => [
		`node scripts/run-in-package.mjs frontend prettier ${files.join(' ')}`,
		`node scripts/run-in-package.mjs frontend oxlint ${files.join(' ')}`
	],
	'frontend/**/*.{svelte,css}': (files) => [
		`node scripts/run-in-package.mjs frontend prettier ${files.join(' ')}`
	]
};