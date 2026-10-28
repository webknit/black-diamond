<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let leaguesMenuOpen = $state(false);
	let leaguesMenu = $state<HTMLElement>();
	let strategiesMenuOpen = $state(false);
	let strategiesMenu = $state<HTMLElement>();
	let accountMenuOpen = $state(false);
	let accountMenu = $state<HTMLElement>();

	function formatBalance(balance: number, currency: string) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(balance);
	}

	function amountOrZero(amount: number | undefined) {
		return typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
	}

	function getHeaderAmounts(account: {
		currentBalance?: number;
		outstandingBetStake?: number;
		currency?: string;
	} | null | undefined) {
		const outstandingBetStake = amountOrZero(account?.outstandingBetStake);

		return {
			bankroll: amountOrZero(account?.currentBalance) + outstandingBetStake,
			outstandingBetStake,
			currency: account?.currency ?? 'GBP'
		};
	}

	const headerAmounts = $derived(getHeaderAmounts(page.data.account));

	onMount(() => {
		function closeOnOutsideClick(event: PointerEvent) {
			if (!(event.target instanceof Node)) return;
			if (leaguesMenu && !leaguesMenu.contains(event.target)) leaguesMenuOpen = false;
			if (strategiesMenu && !strategiesMenu.contains(event.target)) strategiesMenuOpen = false;
			if (accountMenu && !accountMenu.contains(event.target)) accountMenuOpen = false;
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') { leaguesMenuOpen = false; strategiesMenuOpen = false; accountMenuOpen = false; }
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
		<div class="flex items-center justify-between gap-3">
			<a class="text-xl font-semibold tracking-tight text-slate-950" href="/">♦ Black Diamond</a>
			{#if page.data?.account}
				<a
					class="flex flex-col items-end gap-0.5 text-[10px] font-medium leading-none text-slate-600 transition-colors hover:text-slate-950"
					href="/account"
				>
					<span class="tabular-nums">💰 {formatBalance(headerAmounts.bankroll, headerAmounts.currency)}</span>
					<!-- <span class="tabular-nums text-slate-500 text-xxs">{formatBalance(headerAmounts.outstandingBetStake, headerAmounts.currency)} in-play</span> -->
				</a>
			{/if}
		</div>

		<nav class="mt-4 flex items-center gap-5" aria-label="Main navigation">
			{#if page.url.pathname === '/botd'}
				<span aria-current="page" class="inline-flex items-center text-xs font-bold leading-none text-slate-950">
					BOTD
				</span>
			{:else}
				<a class="inline-flex items-center text-xs font-medium leading-none text-slate-700 transition-colors hover:text-slate-950" href="/botd">
					BOTD
				</a>
			{/if}
			<div bind:this={strategiesMenu} class="relative flex items-center">
				<button
					type="button"
					aria-expanded={strategiesMenuOpen}
					aria-haspopup="true"
					class="inline-flex cursor-pointer appearance-none items-center gap-1 border-0 bg-transparent p-0 text-xs font-medium leading-none text-slate-700 transition-colors hover:text-slate-950"
					class:font-bold={page.url.pathname.startsWith('/strategies')}
					class:text-slate-950={page.url.pathname.startsWith('/strategies')}
					onclick={() => (strategiesMenuOpen = !strategiesMenuOpen)}
				>
					Strategies
					<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" class="size-3"><path d="m5 7.5 5 5 5-5" /></svg>
				</button>
				{#if strategiesMenuOpen}
					<div class="absolute left-0 top-full z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
						{#if page.url.pathname === '/strategies'}
							<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Over 2.5 goals</span>
						{:else}
							<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950" href="/strategies" onclick={() => (strategiesMenuOpen = false)}>Over 2.5 goals</a>
						{/if}
						{#if page.url.pathname === '/strategies/over-1-5'}
							<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Over 1.5 goals</span>
						{:else}
							<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950" href="/strategies/over-1-5" onclick={() => (strategiesMenuOpen = false)}>Over 1.5 goals</a>
						{/if}
						{#if page.url.pathname === '/strategies/btts'}
							<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">BTTS</span>
						{:else}
							<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950" href="/strategies/btts" onclick={() => (strategiesMenuOpen = false)}>BTTS</a>
						{/if}
						{#if page.url.pathname === '/strategies/bttns'}
							<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">BTNTS</span>
						{:else}
							<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950" href="/strategies/bttns" onclick={() => (strategiesMenuOpen = false)}>BTNTS</a>
						{/if}
					</div>
				{/if}
			</div>
			<div bind:this={leaguesMenu} class="relative flex items-center">
				<button
					type="button"
					aria-expanded={leaguesMenuOpen}
					aria-haspopup="true"
					class="inline-flex cursor-pointer appearance-none items-center gap-1 border-0 bg-transparent p-0 text-xs font-medium leading-none text-slate-700 transition-colors hover:text-slate-950"
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
					<div class="absolute left-0 top-full z-20 mt-2 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
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
				<div class="ml-auto flex items-center gap-4">
					<div bind:this={accountMenu} class="relative flex items-center">
					<button type="button" aria-expanded={accountMenuOpen} aria-haspopup="true" class="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-xs font-medium leading-none text-slate-700" class:font-bold={page.url.pathname.startsWith('/account')} class:text-slate-950={page.url.pathname.startsWith('/account')} onclick={() => (accountMenuOpen = !accountMenuOpen)}>
						Account
						<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" class="size-3"><path d="m5 7.5 5 5 5-5" /></svg>
					</button>
					{#if accountMenuOpen}
						<div class="absolute right-0 top-full z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
							{#if page.url.pathname === '/account'}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Account</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account" onclick={() => (accountMenuOpen = false)}>Account</a>{/if}
							{#if page.url.pathname === '/account/bets'}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Bets</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account/bets" onclick={() => (accountMenuOpen = false)}>Bets</a>{/if}
							{#if page.url.pathname.startsWith('/account/balance-history')}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Balance history</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account/balance-history" onclick={() => (accountMenuOpen = false)}>Balance history</a>{/if}
							{#if page.url.pathname === '/account/api-status'}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">API status</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account/api-status" onclick={() => (accountMenuOpen = false)}>API status</a>{/if}
							<div class="my-1 border-t border-slate-100"></div>
							<form method="POST" action="/logout">
								<button type="submit" class="block w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950">Log out</button>
							</form>
						</div>
					{/if}
				</div>
				</div>
			{:else if page.url.pathname === '/login'}
				<span aria-current="page" class="ml-auto inline-flex items-center text-xs font-bold leading-none text-slate-950">
					Log in
				</span>
			{:else}
				<a
					class="ml-auto inline-flex items-center text-xs font-medium leading-none text-slate-700 transition-colors hover:text-slate-950"
					href="/login"
				>
					Log in
				</a>
			{/if}
		</nav>
	</div>
</header>
