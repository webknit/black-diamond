<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	type FixtureSearchResult = {
		id: number;
		timestamp: number;
		status: string;
		elapsed: number | null;
		leagueName: string;
		homeTeamName: string;
		awayTeamName: string;
	};

	let leaguesMenuOpen = $state(false);
	let leaguesMenu = $state<HTMLElement>();
	let strategiesMenuOpen = $state(false);
	let strategiesMenu = $state<HTMLElement>();
	let accountMenuOpen = $state(false);
	let accountMenu = $state<HTMLElement>();
	let searchMenuOpen = $state(false);
	let searchMenu = $state<HTMLElement>();
	let searchInput = $state<HTMLInputElement>();
	let searchQuery = $state('');
	let searchResults = $state<FixtureSearchResult[]>([]);
	let highlightedSearchResultIndex = $state(-1);
	let searchRequestId = 0;

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

	function formatSearchDate(timestamp: number) {
		return new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/London',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(timestamp * 1000));
	}

	function isLiveSearchResult(status: string) {
		return ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(status);
	}

	async function toggleSearch() {
		searchMenuOpen = !searchMenuOpen;
		if (searchMenuOpen) {
			await tick();
			searchInput?.focus();
		}
	}

	async function searchFixtures(query: string) {
		const requestId = ++searchRequestId;
		if (query.trim().length < 2) {
			searchResults = [];
			highlightedSearchResultIndex = -1;
			return;
		}

		const response = await fetch(`/api/fixtures/search?q=${encodeURIComponent(query)}`);
		if (!response.ok || requestId !== searchRequestId) return;
		const payload = await response.json() as { fixtures: typeof searchResults };
		if (requestId === searchRequestId) {
			searchResults = payload.fixtures;
			highlightedSearchResultIndex = -1;
		}
	}

	async function openSearchResult(fixtureId: number) {
		searchMenuOpen = false;
		searchQuery = '';
		searchResults = [];
		highlightedSearchResultIndex = -1;
		await goto(`/fixtures/${fixtureId}`);
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' && searchResults.length > 0) {
			event.preventDefault();
			highlightedSearchResultIndex = Math.min(highlightedSearchResultIndex + 1, searchResults.length - 1);
			return;
		}

		if (event.key === 'ArrowUp' && searchResults.length > 0) {
			event.preventDefault();
			highlightedSearchResultIndex = Math.max(highlightedSearchResultIndex - 1, 0);
			return;
		}

		if (event.key === 'Enter' && highlightedSearchResultIndex >= 0) {
			event.preventDefault();
			void openSearchResult(searchResults[highlightedSearchResultIndex].id);
			return;
		}

		if (event.key === 'Escape') {
			searchMenuOpen = false;
		}
	}

	onMount(() => {
		function closeOnOutsideClick(event: PointerEvent) {
			if (!(event.target instanceof Node)) return;
			if (leaguesMenu && !leaguesMenu.contains(event.target)) leaguesMenuOpen = false;
			if (strategiesMenu && !strategiesMenu.contains(event.target)) strategiesMenuOpen = false;
			if (accountMenu && !accountMenu.contains(event.target)) accountMenuOpen = false;
			if (searchMenu && !searchMenu.contains(event.target)) searchMenuOpen = false;
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') { leaguesMenuOpen = false; strategiesMenuOpen = false; accountMenuOpen = false; searchMenuOpen = false; }
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
				<div bind:this={accountMenu} class="relative">
					<button
						type="button"
						aria-expanded={accountMenuOpen}
						aria-haspopup="true"
						class="flex items-center gap-1 border-0 bg-transparent p-0 text-[10px] font-medium leading-none text-slate-600 transition-colors hover:text-slate-950"
						onclick={() => (accountMenuOpen = !accountMenuOpen)}
					>
						<span class="tabular-nums">💰 {formatBalance(headerAmounts.bankroll, headerAmounts.currency)}</span>
						<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" class="size-3"><path d="m5 7.5 5 5 5-5" /></svg>
					</button>
					{#if accountMenuOpen}
						<div class="absolute right-0 top-full z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
							{#if page.url.pathname === '/account'}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Account</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account" onclick={() => (accountMenuOpen = false)}>Account</a>{/if}
							{#if page.url.pathname === '/account/bets'}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Bets</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account/bets" onclick={() => (accountMenuOpen = false)}>Bets</a>{/if}
							{#if page.url.pathname.startsWith('/account/balance-history')}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Balance history</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account/balance-history" onclick={() => (accountMenuOpen = false)}>Balance history</a>{/if}
							{#if page.url.pathname === '/account/api-status'}<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">API status</span>{:else}<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" href="/account/api-status" onclick={() => (accountMenuOpen = false)}>API status</a>{/if}
							<div class="my-1 border-t border-slate-100"></div>
							<form method="POST" action="/logout"><button type="submit" class="block w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950">Log out</button></form>
						</div>
					{/if}
				</div>
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
						{#if page.url.pathname === '/strategies/over-2-5'}
							<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Over 2.5 goals</span>
						{:else}
							<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950" href="/strategies/over-2-5" onclick={() => (strategiesMenuOpen = false)}>Over 2.5 goals</a>
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
						{#if page.url.pathname === '/strategies/btnts'}
							<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">BTNTS</span>
						{:else}
							<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950" href="/strategies/btnts" onclick={() => (strategiesMenuOpen = false)}>BTNTS</a>
						{/if}
						<div class="my-1 border-t border-slate-100"></div>
						{#if page.url.pathname === '/strategies/top'}
							<span aria-current="page" class="block rounded-md px-3 py-2 text-xs font-bold text-slate-950">Top strategies</span>
						{:else}
							<a class="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950" href="/strategies/top" onclick={() => (strategiesMenuOpen = false)}>Top strategies</a>
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
				{#if page.url.pathname === '/watchlist'}
					<span aria-current="page" class="inline-flex items-center text-xs font-bold leading-none text-slate-950">Watchlist</span>
				{:else}
					<a class="inline-flex items-center text-xs font-medium leading-none text-slate-700 transition-colors hover:text-slate-950" href="/watchlist">Watchlist</a>
				{/if}
			{/if}
			<div bind:this={searchMenu} class="relative ml-auto flex items-center">
				<button
					type="button"
					aria-label="Search fixtures"
					aria-expanded={searchMenuOpen}
					aria-haspopup="true"
					class="inline-flex size-4 items-center justify-center border-0 bg-transparent p-0 text-slate-700 transition-colors hover:text-slate-950"
					onclick={toggleSearch}
				>
					<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" class="size-4"><circle cx="8.5" cy="8.5" r="4.5" /><path d="m12 12 4 4" /></svg>
				</button>
				{#if searchMenuOpen}
					<div class="absolute right-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
						<label class="sr-only" for="fixture-search">Search fixtures</label>
						<input
							id="fixture-search"
							bind:this={searchInput}
							type="search"
							placeholder="Search a team or league"
							value={searchQuery}
							oninput={(event) => { searchQuery = event.currentTarget.value; void searchFixtures(searchQuery); }}
							onkeydown={handleSearchKeydown}
							class="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-700"
						/>
						{#if searchQuery.trim().length >= 2}
							<div class="mt-2 max-h-72 overflow-y-auto">
								{#if searchResults.length === 0}
									<p class="px-2 py-3 text-xs text-slate-500">No fixtures found.</p>
								{:else}
									{#each searchResults as fixture, index (fixture.id)}
										<a
											href={`/fixtures/${fixture.id}`}
											class="block rounded-md px-2 py-2 hover:bg-slate-50"
											class:bg-slate-100={highlightedSearchResultIndex === index}
											onmouseenter={() => (highlightedSearchResultIndex = index)}
											onclick={(event) => { event.preventDefault(); void openSearchResult(fixture.id); }}
										>
											<div class="flex items-center gap-1.5">
												<p class="text-xs font-medium text-slate-900">{fixture.homeTeamName} v {fixture.awayTeamName}</p>
												{#if isLiveSearchResult(fixture.status)}
													<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
														<span class="size-1.5 rounded-full bg-emerald-500"></span>
														{fixture.elapsed === null ? 'LIVE' : `${fixture.elapsed}'`}
													</span>
												{/if}
											</div>
											<p class="mt-0.5 text-[10px] text-slate-500">{formatSearchDate(fixture.timestamp)} · {fixture.leagueName}</p>
										</a>
									{/each}
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
			{#if !page.data.account && page.url.pathname === '/login'}
				<span aria-current="page" class="inline-flex items-center text-xs font-bold leading-none text-slate-950">
					Log in
				</span>
			{:else if !page.data.account}
				<a
					class="inline-flex items-center text-xs font-medium leading-none text-slate-700 transition-colors hover:text-slate-950"
					href="/login"
				>
					Log in
				</a>
			{/if}
		</nav>
	</div>
</header>
