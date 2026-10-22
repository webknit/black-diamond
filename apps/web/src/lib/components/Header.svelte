<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let leaguesMenuOpen = $state(false);
	let leaguesMenu = $state<HTMLElement>();
	let accountMenuOpen = $state(false);
	let accountMenu = $state<HTMLElement>();

	onMount(() => {
		function closeOnOutsideClick(event: PointerEvent) {
			if (!(event.target instanceof Node)) return;
			if (leaguesMenu && !leaguesMenu.contains(event.target)) leaguesMenuOpen = false;
			if (accountMenu && !accountMenu.contains(event.target)) accountMenuOpen = false;
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') { leaguesMenuOpen = false; accountMenuOpen = false; }
		}

		document.addEventListener('pointerdown', closeOnOutsideClick);
		document.addEventListener('keydown', closeOnEscape);

		return () => {
			document.removeEventListener('pointerdown', closeOnOutsideClick);
			document.removeEventListener('keydown', closeOnEscape);
		};
	});
</script>

<header class="border-b border-slate-200 bg-white">
	<div class="mx-auto max-w-7xl px-6 py-5">
		<a class="text-xl font-semibold tracking-tight text-slate-950" href="/">♦ Black Diamond</a>

		<nav class="mt-4 flex items-center gap-5" aria-label="Main navigation">
			{#if page.url.pathname === '/'}
				<span aria-current="page" class="inline-flex h-4 items-center text-xs font-bold leading-none text-slate-950">Home</span>
			{:else}
				<a
					class="inline-flex h-4 items-center text-xs font-medium leading-none text-slate-700 transition-colors hover:text-slate-950"
					href="/"
				>
					Home
				</a>
			{/if}
			<div bind:this={leaguesMenu} class="relative">
				<button
					type="button"
					aria-expanded={leaguesMenuOpen}
					aria-haspopup="true"
					class="inline-flex h-4 cursor-pointer appearance-none items-center gap-1 border-0 bg-transparent p-0 text-xs font-medium leading-none text-slate-700 transition-colors hover:text-slate-950"
					class:font-bold={page.url.pathname.startsWith('/league-')}
					class:text-slate-950={page.url.pathname.startsWith('/league-')}
					onclick={() => (leaguesMenuOpen = !leaguesMenuOpen)}
				>
					Leagues
					<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" class="size-3">
						<path d="m5 7.5 5 5 5-5" />
					</svg>
				</button>
				{#if leaguesMenuOpen}
					<div class="absolute left-0 z-20 mt-2 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
					{#if page.url.pathname === '/league-standings'}
						<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">
							League standings
						</span>
					{:else}
						<a
							class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950"
							href="/league-standings"
							onclick={() => (leaguesMenuOpen = false)}
						>
							League standings
						</a>
					{/if}
					{#if page.url.pathname === '/league-stats'}
						<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">
							League stats
						</span>
					{:else}
						<a
							class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950"
							href="/league-stats"
							onclick={() => (leaguesMenuOpen = false)}
						>
							League stats
						</a>
					{/if}
					</div>
				{/if}
			</div>
			{#if page.data.account}
				<div bind:this={accountMenu} class="relative">
					<button type="button" aria-expanded={accountMenuOpen} aria-haspopup="true" class="inline-flex h-4 items-center gap-1 border-0 bg-transparent p-0 text-xs font-medium leading-none text-slate-700" class:font-bold={page.url.pathname.startsWith('/account')} class:text-slate-950={page.url.pathname.startsWith('/account')} onclick={() => (accountMenuOpen = !accountMenuOpen)}>
						Account
						<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" class="size-3"><path d="m5 7.5 5 5 5-5" /></svg>
					</button>
					{#if accountMenuOpen}
						<div class="absolute left-0 z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
							{#if page.url.pathname === '/account'}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Account</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account" onclick={() => (accountMenuOpen = false)}>Account</a>{/if}
							{#if page.url.pathname === '/account/bets'}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Bets</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account/bets" onclick={() => (accountMenuOpen = false)}>Bets</a>{/if}
							{#if page.url.pathname.startsWith('/account/balance-history')}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Balance history</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account/balance-history" onclick={() => (accountMenuOpen = false)}>Balance history</a>{/if}
							<div class="my-1 border-t border-slate-100"></div>
							<form method="POST" action="/logout">
								<button type="submit" class="block w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950">Log out</button>
							</form>
						</div>
					{/if}
				</div>
			{:else if page.url.pathname === '/login'}
				<span aria-current="page" class="inline-flex h-4 items-center text-xs font-bold leading-none text-slate-950">
					Log in
				</span>
			{:else}
				<a
					class="inline-flex h-4 items-center text-xs font-medium leading-none text-slate-700 transition-colors hover:text-slate-950"
					href="/login"
				>
					Log in
				</a>
			{/if}
		</nav>
	</div>
</header>
