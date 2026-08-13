<script lang="ts">
	import { authClient } from '$lib/auth-client';

	const session = authClient.useSession();

	let email = $state('');
	let password = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit() {
		error = null;
		submitting = true;
		try {
			const { error: authError } = await authClient.signIn.email({ email, password });
			if (authError) {
				error = authError.message ?? 'Something went wrong';
				return;
			}
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head><title>Sign in</title></svelte:head>

{#if $session.data}
	<h1 class="text-2xl font-bold text-gray-900">You're signed in</h1>
	<p class="mt-2 text-gray-600">
		Hello, <span class="font-semibold">{$session.data.user.name}</span>. Head to
		<a href="/items" class="underline">your items</a>.
	</p>
	<button
		class="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
		onclick={() => authClient.signOut()}
	>
		Sign out
	</button>
{:else}
	<h1 class="text-2xl font-bold text-gray-900">Sign in</h1>
	<p class="mt-2 text-gray-600">Sign in to access your items.</p>

	<form
		class="mt-6 flex max-w-sm flex-col gap-4"
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
	>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-gray-700">Email</span>
			<input
				bind:value={email}
				type="email"
				required
				class="rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
			/>
		</label>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-gray-700">Password</span>
			<input
				bind:value={password}
				type="password"
				required
				class="rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
			/>
		</label>

		{#if error}
			<p class="text-sm text-red-600">{error}</p>
		{/if}

		<button
			class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
			type="submit"
			disabled={submitting}
		>
			{submitting ? 'Signing in…' : 'Sign in'}
		</button>
	</form>

	<p class="mt-4 text-sm text-gray-600">
		No account? <a href="/signup" class="underline">Sign up</a>.
	</p>
{/if}
