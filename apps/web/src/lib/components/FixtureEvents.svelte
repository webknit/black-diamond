<script lang="ts">
	import type { FixtureEvent } from '@black-diamond/core/fixtureEvents';

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
		status
	}: {
		events: FixtureEvent[];
		homeTeam: Team;
		awayTeam: Team;
		homeGoals: number | null;
		awayGoals: number | null;
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

</script>

{#if events.length > 0}
	<div class="mt-2 border-t border-slate-100 pt-2 text-center">
		<button type="button" class="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-slate-900 active:scale-[0.98]" onclick={() => (isOpen = true)}>
			<span aria-hidden="true">⚽</span>
			<span>{goals.length} {goals.length === 1 ? 'goal' : 'goals'}</span>
			{#if yellowCards > 0}<span>· 🟨 {yellowCards}</span>{/if}
			{#if redCards > 0}<span>· 🟥 {redCards}</span>{/if}
		</button>
	</div>
{/if}

{#if isOpen}
	<div class="fixed inset-0 z-40 bg-slate-950/30" role="presentation" onclick={() => (isOpen = false)}></div>
	<div role="dialog" aria-modal="true" aria-label="Match events" class="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-white p-3 shadow-2xl sm:max-h-[75vh] sm:w-[28rem] sm:p-4">
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
			<button type="button" class="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close match events" onclick={() => (isOpen = false)}>✕</button>
			</div>
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
	</div>
{/if}
