<script lang="ts">
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Black Diamond · Log in</title>
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto flex max-w-md justify-center px-4 py-10 sm:py-16">
		<section class="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
			<h1 class="text-xl font-semibold tracking-tight text-slate-950">Log in</h1>
			<p class="mt-1 text-sm text-slate-600">Use the account you created during setup.</p>

			<form method="POST" class="mt-6 space-y-4">
				<div>
					<label for="email" class="mb-1 block text-xs font-semibold text-slate-700">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						value={form?.email ?? ''}
						required
						class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
					/>
				</div>
				<div>
					<label for="password" class="mb-1 block text-xs font-semibold text-slate-700">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
					/>
				</div>

				{#if form?.message}
					<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{form.message}</p>
				{/if}

				<button type="submit" class="w-full rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
					Log in
				</button>
			</form>
		</section>
	</div>
</main>
