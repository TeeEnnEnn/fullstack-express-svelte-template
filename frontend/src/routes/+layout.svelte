<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header class="border-b border-gray-200">
	<nav class="mx-auto flex max-w-2xl items-center gap-6 px-4 py-3">
		<a href="/" class="font-semibold text-gray-900">Template</a>
		<a href="/" class="text-sm text-gray-600 hover:text-gray-900">Health</a>
		<a href="/items" class="text-sm text-gray-600 hover:text-gray-900">Items</a>
		<a href="/signup" class="text-sm text-gray-600 hover:text-gray-900">Sign up</a>
	</nav>
</header>

<main class="mx-auto max-w-2xl px-4 py-8">
	{@render children()}
</main>
