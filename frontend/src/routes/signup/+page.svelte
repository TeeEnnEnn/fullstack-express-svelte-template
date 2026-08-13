<script lang="ts">
	import { authClient } from '$lib/auth-client';

	const session = authClient.useSession();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);
	let done = $state(false);

	async function handleSubmit() {
		error = null;
		submitting = true;
		try {
			const { error: authError } = await authClient.signUp.email({
				name,
				email,
				password
			});
			if (authError) {
				error = authError.message ?? 'Something went wrong';
				return;
			}
			done = true;
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head><title>Sign up</title></svelte:head>

{#if $session.data}
	<h1 class="text-2xl font-bold text-gray-900">You're signed in</h1>
	<p class="mt-2 text-gray-600">
		Hello, <span class="font-semibold">{$session.data.user.name}</span>
		({$session.data.user.email}).
	</p>
	<button
		class="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
		onclick={() => authClient.signOut()}
	>
		Sign out
	</button>
{:else if done}
	<h1 class="text-2xl font-bold text-gray-900">Signed up!</h1>
	<p class="mt-2 text-gray-600">
		Your session is active. Reload the page or sign out to test the flow.
	</p>
{:else}
	<h1 class="text-2xl font-bold text-gray-900">Sign up</h1>
	<p class="mt-2 text-gray-600">
		Create an account. This calls <code class="font-mono">POST /api/auth/sign-up/email</code> on the Express
		backend.
	</p>

	<form
		class="mt-6 flex max-w-sm flex-col gap-4"
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
	>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-gray-700">Name</span>
			<input
				bind:value={name}
				required
				class="rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
			/>
		</label>
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
				minlength="8"
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
			{submitting ? 'Creating account…' : 'Create account'}
		</button>
	</form>
{/if}
