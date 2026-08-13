<script lang="ts">
	import { api } from '$lib/api/client';
	import { authClient } from '$lib/auth-client';
	import type { components } from '$lib/api/schema';

	type Item = components['schemas']['Item'];

	const session = authClient.useSession();

	let items = $state<Item[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let name = $state('');
	let submitting = $state(false);

	async function load() {
		loading = true;
		error = null;
		const { data, error: err } = await api.GET('/api/items');
		if (err) {
			error = 'Failed to load items';
			return;
		}
		items = data.items;
		loading = false;
	}

	async function add() {
		submitting = true;
		error = null;
		const { data, error: err } = await api.POST('/api/items', { body: { name } });
		if (err) {
			error = 'Failed to add item';
			submitting = false;
			return;
		}
		items = [data, ...items];
		name = '';
		submitting = false;
	}

	$effect(() => {
		if ($session.data) load();
	});
</script>

<svelte:head><title>Items</title></svelte:head>

{#if !$session.data}
	<h1 class="text-2xl font-bold text-gray-900">Sign in required</h1>
	<p class="mt-2 text-gray-600">
		This page lists your items and is only available while signed in.
	</p>
	<a
		href="/signin"
		class="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
	>
		Sign in
	</a>
{:else}
	<h1 class="text-2xl font-bold text-gray-900">Your items</h1>
	<p class="mt-2 text-gray-600">
		Signed in as <span class="font-semibold">{$session.data.user.name}</span>. Items live in the
		<code class="font-mono">items</code> table and are fetched via the type-safe OpenAPI client.
	</p>

	<form
		class="mt-6 flex max-w-sm gap-2"
		onsubmit={(e) => {
			e.preventDefault();
			add();
		}}
	>
		<input
			bind:value={name}
			placeholder="Add an item…"
			required
			class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
		/>
		<button
			class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
			type="submit"
			disabled={submitting || name.length === 0}
		>
			{submitting ? 'Adding…' : 'Add'}
		</button>
	</form>

	{#if error}
		<p class="mt-3 text-sm text-red-600">{error}</p>
	{/if}

	<div class="mt-8">
		{#if loading}
			<p class="text-sm text-gray-500">Loading…</p>
		{:else if items.length === 0}
			<p class="text-sm text-gray-500">No items yet — add your first one above.</p>
		{:else}
			<ul class="divide-y divide-gray-200 rounded-lg border border-gray-200">
				{#each items as item (item.id)}
					<li class="flex items-center justify-between px-4 py-3">
						<span class="font-medium text-gray-900">{item.name}</span>
						<span class="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
