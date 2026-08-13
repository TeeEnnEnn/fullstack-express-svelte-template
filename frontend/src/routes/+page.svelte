<script lang="ts">
	import { api } from '$lib/api/client';

	let status = $state<'idle' | 'loading' | 'ok' | 'error'>('idle');
	let message = $state('');

	async function ping() {
		status = 'loading';
		const { data, error } = await api.GET('/api/health');
		if (error) {
			status = 'error';
			message = `Backend degraded (API: ${error.status} · DB: ${error.db})`;
			return;
		}
		status = 'ok';
		message = `API: ${data.status} · DB: ${data.db}`;
	}
</script>

<h1 class="text-2xl font-bold text-gray-900">Full-stack Svelte template</h1>
<p class="mt-2 text-gray-600">
	Express + Drizzle + Better Auth backend, SvelteKit frontend, types generated from an OpenAPI spec.
</p>

<div class="mt-8 rounded-lg border border-gray-200 p-4">
	<h2 class="text-sm font-semibold tracking-wide text-gray-500 uppercase">Backend health</h2>

	{#if status === 'idle'}
		<p class="mt-2 text-sm text-gray-500">
			Hit the button to ping <code class="font-mono">GET /api/health</code>.
		</p>
	{:else if status === 'loading'}
		<p class="mt-2 text-sm text-gray-500">Pinging…</p>
	{:else}
		<p class="mt-2 text-sm">
			<span
				class="inline-block size-2 rounded-full bg-green-500"
				class:bg-red-500={status === 'error'}
			></span>
			<span class="ml-1">{message}</span>
		</p>
	{/if}

	<button
		class="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
		disabled={status === 'loading'}
		onclick={ping}
	>
		Ping backend
	</button>
</div>
