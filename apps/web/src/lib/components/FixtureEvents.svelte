<script lang="ts">
	import type { FixtureEvent } from '@black-diamond/core/fixtureEvents';
	import Modal from './modal/Modal.svelte';

	type Team = {
		id: number;
		name: string;
		logo: string;
	};

	let {
		events,
		homeTeam,
		awayTeam,
		homeGoals,
		awayGoals,
		statistics,
		status
	}: {
		events: FixtureEvent[];
		homeTeam: Team;
		awayTeam: Team;
		homeGoals: number | null;
		awayGoals: number | null;
		statistics: {
			home: { shots: number | null; shotsOnTarget: number | null; possession: number | null };
			away: { shots: number | null; shotsOnTarget: number | null; possession: number | null };
		} | null;
		status: string;
	} = $props();
	let isOpen = $state(false);

	const goals = $derived(events.filter((event) => event.type === 'Goal'));
	const yellowCards = $derived(events.filter((event) => event.detail?.includes('Yellow')).length);
	const redCards = $derived(events.filter((event) => event.detail?.includes('Red')).length);

	function eventMinute(event: FixtureEvent) {
		return `${event.time.elapsed ?? '–'}′${event.time.extra ? `+${event.time.extra}` : ''}`;
	}

	function eventIcon(event: FixtureEvent) {
		if (event.type === 'Goal') return '⚽';
		if (event.type === 'Card') return event.detail?.includes('Red') ? '🟥' : '🟨';
		if (event.type === 'subst') return '⇄';
		if (event.type === 'Var') return 'VAR';
		return '•';
	}

	function statisticValue(value: number | null | undefined, suffix = '') {
		return value == null ? '–' : `${value}${suffix}`;
	}

	function comparisonWidth(left: number | null | undefined, right: number | null | undefined, side: 'left' | 'right') {
		if (left == null || right == null || left + right === 0) return '50%';
		return `${((side === 'left' ? left : right) / (left + right)) * 100}%`;
	}

</script>

{#if events.length > 0}
	<div class="mt-2 border-t border-slate-100 pt-2 text-center">
		<button type="button" class="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-slate-900 active:scale-[0.98]" onclick={() => (isOpen = true)}>
			<span aria-hidden="true">⚽</span>
			<span>{goals.length}</span>
			{#if yellowCards > 0}<span>· 🟨 {yellowCards}</span>{/if}
			{#if redCards > 0}<span>· 🟥 {redCards}</span>{/if}
		</button>
	</div>
{/if}

{#if isOpen}
	<Modal bind:isOpen label="Match events">
		<header class="shrink-0 border-b border-slate-100 pb-2 sm:pb-3">
			<div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 text-center">
				<div class="min-w-0">
					<img class="mx-auto size-9 object-contain" src={homeTeam.logo} alt="" />
					<p class="mt-1 truncate text-xs font-semibold text-slate-900">{homeTeam.name}</p>
				</div>
				<div class="min-w-16">
					<p class="text-lg font-bold tabular-nums text-slate-950">
						{homeGoals ?? '–'} <span class="text-slate-400">–</span> {awayGoals ?? '–'}
					</p>
					<p class="mt-0.5 text-[10px] font-semibold text-slate-500">{status}</p>
				</div>
				<div class="min-w-0">
					<img class="mx-auto size-9 object-contain" src={awayTeam.logo} alt="" />
					<p class="mt-1 truncate text-xs font-semibold text-slate-900">{awayTeam.name}</p>
				</div>
			</div>
			<div class="mt-3 flex items-center justify-between gap-3">
				<p class="text-xs text-slate-500">{events.length} recorded events</p>
			<button type="button" data-modal-close class="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close match events">✕</button>
			</div>
			{#if statistics}
				<div class="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-1.5 rounded-lg bg-slate-50 px-3 py-3 text-center text-[11px] tabular-nums">
					<div class="font-semibold text-slate-900">{statisticValue(statistics.home.shots)}</div>
					<div class="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Shots</div>
					<div class="font-semibold text-slate-900">{statisticValue(statistics.away.shots)}</div>
					<div class="col-span-3 flex h-1 overflow-hidden rounded-full bg-slate-200">
						<span class="bg-emerald-500" style:width={comparisonWidth(statistics.home.shots, statistics.away.shots, 'left')}></span>
						<span class="bg-slate-400" style:width={comparisonWidth(statistics.home.shots, statistics.away.shots, 'right')}></span>
					</div>
					<div class="mt-1 font-semibold text-slate-900">{statisticValue(statistics.home.shotsOnTarget)}</div>
					<div class="mt-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">On target</div>
					<div class="mt-1 font-semibold text-slate-900">{statisticValue(statistics.away.shotsOnTarget)}</div>
					<div class="col-span-3 flex h-1 overflow-hidden rounded-full bg-slate-200">
						<span class="bg-emerald-500" style:width={comparisonWidth(statistics.home.shotsOnTarget, statistics.away.shotsOnTarget, 'left')}></span>
						<span class="bg-slate-400" style:width={comparisonWidth(statistics.home.shotsOnTarget, statistics.away.shotsOnTarget, 'right')}></span>
					</div>
					<div class="mt-1 font-semibold text-slate-900">{statisticValue(statistics.home.possession, '%')}</div>
					<div class="mt-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">Possession</div>
					<div class="mt-1 font-semibold text-slate-900">{statisticValue(statistics.away.possession, '%')}</div>
					<div class="col-span-3 flex h-1 overflow-hidden rounded-full bg-slate-200">
						<span class="bg-emerald-500" style:width={comparisonWidth(statistics.home.possession, statistics.away.possession, 'left')}></span>
						<span class="bg-slate-400" style:width={comparisonWidth(statistics.home.possession, statistics.away.possession, 'right')}></span>
					</div>
				</div>
			{/if}
		</header>
		<ol class="mt-2 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto sm:mt-3">
			{#each events as event, index (`${event.time.elapsed}-${event.type}-${event.player.id}-${index}`)}
				<li class="grid grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] items-center gap-2 py-2 text-xs">
					<div class="min-w-0 text-left">
						{#if event.team.id === homeTeam.id}
							<p class="break-words font-medium text-slate-900">{event.player.name ?? event.detail ?? event.type}</p>
							{#if event.assist.name}
								<p class="mt-0.5 break-words text-[10px] text-slate-500">Assist: {event.assist.name}</p>
							{/if}
						{/if}
					</div>
					<div class="text-center">
						<span class="block font-semibold tabular-nums text-slate-500">{eventMinute(event)}</span>
						<span class="block" aria-label={event.type}>{eventIcon(event)}</span>
					</div>
					<div class="min-w-0 text-right">
						{#if event.team.id === awayTeam.id}
							<p class="break-words font-medium text-slate-900">{event.player.name ?? event.detail ?? event.type}</p>
							{#if event.assist.name}
								<p class="mt-0.5 break-words text-[10px] text-slate-500">Assist: {event.assist.name}</p>
							{/if}
						{/if}
					</div>
				</li>
			{/each}
		</ol>
	</Modal>
{/if}
