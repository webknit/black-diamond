<script lang="ts">
	import { onMount } from 'svelte';

	type FormScope = 'home' | 'away' | 'overall';
	type FormFixture = {
		id: number;
		timestamp: number;
		opponent: string;
		opponentLogo: string;
		venue: 'Home' | 'Away';
		homeGoals: number;
		awayGoals: number;
		outcome: 'W' | 'D' | 'L';
	};

	let {
		fixtureId,
		teamId,
		teamName,
		scope,
		onClose
	}: {
		fixtureId: number;
		teamId: number;
		teamName: string;
		scope: FormScope;
		onClose: () => void;
	} = $props();
	let fixtures = $state<FormFixture[]>([]);
	let loading = $state(true);
	let failed = $state(false);

	const scopeLabel = $derived(scope === 'overall' ? 'Overall' : scope === 'home' ? 'Home' : 'Away');

	function formatDate(timestamp: number) {
		return new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/London',
			day: 'numeric',
			month: 'short'
		}).format(new Date(timestamp * 1000));
	}

	async function loadForm() {
		try {
			const response = await fetch(`/api/fixtures/${fixtureId}/form?teamId=${teamId}&venue=${scope}`);
			if (!response.ok) throw new Error('Could not load recent fixtures');
			fixtures = (await response.json()).fixtures;
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void loadForm();
	});
</script>

<div class="fixed inset-0 z-40 bg-slate-950/30" role="presentation" onclick={onClose}></div>
<dialog
	open
	aria-label={`${teamName} recent ${scopeLabel.toLowerCase()} fixtures`}
	class="fixed left-1/2 top-1/2 z-50 m-0 flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border-0 bg-white p-3 shadow-2xl sm:max-h-[32rem] sm:p-4"
>
	<header class="relative shrink-0 border-b border-slate-100 pb-3 text-center">
		<h2 class="text-sm font-semibold text-slate-900">{teamName}</h2>
		<p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Last 5 · {scopeLabel}</p>
		<button type="button" class="absolute right-0 top-0 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close recent fixtures" onclick={onClose}>✕</button>
	</header>

	{#if loading}
		<div class="flex flex-1 flex-col items-center justify-center" role="status">
			<span class="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700"></span>
			<p class="mt-3 text-xs text-slate-500">Loading recent fixtures…</p>
		</div>
	{:else if failed}
		<p class="py-8 text-center text-xs text-slate-500">Recent fixtures could not be loaded.</p>
	{:else if fixtures.length === 0}
		<p class="py-8 text-center text-xs text-slate-500">No earlier completed fixtures found.</p>
	{:else}
		<ol class="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
			{#each fixtures as fixture (fixture.id)}
				<li class="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2 py-2.5 text-xs">
					<span class="flex size-5 items-center justify-center rounded text-[10px] font-bold"
						class:bg-emerald-100={fixture.outcome === 'W'}
						class:text-emerald-800={fixture.outcome === 'W'}
						class:bg-amber-100={fixture.outcome === 'D'}
						class:text-amber-800={fixture.outcome === 'D'}
						class:bg-rose-100={fixture.outcome === 'L'}
						class:text-rose-800={fixture.outcome === 'L'}
					>{fixture.outcome}</span>
					<img class="size-5 object-contain" src={fixture.opponentLogo} alt="" />
					<div class="min-w-0">
						<p class="truncate font-medium text-slate-900">{fixture.opponent}</p>
						<p class="mt-0.5 text-[10px] text-slate-500">{fixture.venue} · {formatDate(fixture.timestamp)}</p>
					</div>
					<p class="font-semibold tabular-nums text-slate-900">{fixture.homeGoals} – {fixture.awayGoals}</p>
				</li>
			{/each}
		</ol>
	{/if}
</dialog>
