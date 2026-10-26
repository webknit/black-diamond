<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from './modal/Modal.svelte';

	type FormScope = 'home' | 'away' | 'overall';
	type FormFixture = {
		id: number;
		timestamp: number;
		opponent: string;
		opponentLogo: string;
		venue: 'Home' | 'Away';
		homeGoals: number;
		awayGoals: number;
		leaguePosition: number | null;
		leagueTeams: number | null;
		outcome: 'W' | 'D' | 'L';
	};

	let {
		requestId,
		fixtureId,
		teamId,
		teamName,
		scope,
		onClose
	}: {
		requestId: number;
		fixtureId: number;
		teamId: number;
		teamName: string;
		scope: FormScope;
		onClose: (requestId: number) => void;
	} = $props();
	let fixtures = $state<FormFixture[]>([]);
	let loading = $state(true);
	let failed = $state(false);
	let isOpen = $state(true);

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

<Modal bind:isOpen label={`${teamName} recent ${scopeLabel.toLowerCase()} fixtures`} onClose={() => onClose(requestId)}>
	<header class="relative shrink-0 border-b border-slate-100 pb-3 text-center">
		<h2 class="text-sm font-semibold text-slate-900">{teamName}</h2>
		<p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Last 5 · {scopeLabel}</p>
		<button type="button" data-modal-close class="absolute right-0 top-0 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close recent fixtures">✕</button>
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
						<p class="truncate font-medium text-slate-900">
							{fixture.opponent}
							{#if fixture.leaguePosition !== null && fixture.leagueTeams !== null}<span class="ml-1 text-[10px] font-normal text-slate-400">(<span class="text-slate-500">{fixture.leaguePosition}</span>/{fixture.leagueTeams})</span>{/if}
						</p>
						<p class="mt-0.5 text-[10px] text-slate-500">{fixture.venue} · {formatDate(fixture.timestamp)}</p>
					</div>
					<p class="font-semibold tabular-nums text-slate-900">{fixture.homeGoals} – {fixture.awayGoals}</p>
				</li>
			{/each}
		</ol>
	{/if}
</Modal>
