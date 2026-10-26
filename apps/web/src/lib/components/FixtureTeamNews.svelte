<script lang="ts">
	import type { FixtureInjury } from '@black-diamond/core/fixtureInjuries';
	import type { FixtureTeamLineup } from '@black-diamond/core/fixtureLineups';

	let {
		injuries,
		lineups,
		homeTeam,
		awayTeam
	}: {
		injuries: FixtureInjury[] | null;
		lineups: FixtureTeamLineup[] | null;
		homeTeam: { id: number; name: string };
		awayTeam: { id: number; name: string };
	} = $props();
	let isOpen = $state(false);

	const reportedInjuries = $derived(injuries ?? []);
	const uniqueInjuries = $derived(
		reportedInjuries.filter(
			(injury, index) =>
				reportedInjuries.findIndex(
					(candidate) =>
						candidate.team.id === injury.team.id && candidate.player.id === injury.player.id
				) === index
		)
	);
	const homeInjuries = $derived(uniqueInjuries.filter((injury) => injury.team.id === homeTeam.id));
	const awayInjuries = $derived(uniqueInjuries.filter((injury) => injury.team.id === awayTeam.id));
	const homeLineup = $derived(lineups?.find((lineup) => lineup.teamId === homeTeam.id) ?? null);
	const awayLineup = $derived(lineups?.find((lineup) => lineup.teamId === awayTeam.id) ?? null);
	const hasAnnouncedLineup = $derived(lineups?.some((lineup) => lineup.startXI.length > 0) ?? false);

	function injuryDescription(injury: FixtureInjury) {
		return injury.player.reason ?? injury.player.type;
	}
</script>

{#if injuries !== null || lineups !== null}
	<div class="mt-2 text-center">
		<button
			type="button"
			class="cursor-pointer text-[10px] text-slate-500 underline decoration-slate-300 underline-offset-2 transition hover:text-emerald-700 hover:decoration-emerald-500"
			onclick={() => (isOpen = true)}
		>
			<span>Team news</span>
			{#if uniqueInjuries.length > 0 && !hasAnnouncedLineup}<span>· 🏥 {uniqueInjuries.length}</span>{/if}
		</button>
	</div>
{/if}

{#if isOpen}
	<div class="fixed inset-0 z-40 bg-slate-950/30" role="presentation" onclick={() => (isOpen = false)}></div>
	<dialog
		open
		aria-label="Team news"
		class="fixed left-1/2 top-1/2 z-50 m-0 flex h-[min(32rem,calc(100dvh-1rem))] w-[calc(100%-1rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border-0 bg-white p-3 shadow-2xl sm:h-[min(38rem,80vh)] sm:p-4"
	>
		<header class="relative shrink-0 border-b border-slate-100 pb-3 text-center">
			<h2 class="text-sm font-semibold text-slate-900">Team news</h2>
			<button type="button" class="absolute right-0 top-0 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close team news" onclick={() => (isOpen = false)}>✕</button>
		</header>

		<div class="grid min-h-0 flex-1 grid-cols-2 divide-x divide-slate-100 overflow-y-auto">
			{#each [
				{ team: homeTeam, lineup: homeLineup, injuries: homeInjuries, alignment: 'text-left' },
				{ team: awayTeam, lineup: awayLineup, injuries: awayInjuries, alignment: 'text-right' }
			] as side (side.team.id)}
				<section class="min-w-0 px-2 sm:px-3" class:pl-0={side.team.id === homeTeam.id} class:pr-0={side.team.id === awayTeam.id}>
					<h3 class="sticky top-0 bg-white py-2 text-center text-[10px] font-semibold text-slate-500">{side.team.name}</h3>
					<div class={side.alignment}>
						{#if side.lineup}
							<p class="text-[10px] font-semibold uppercase tracking-wide text-sky-700">
								{side.lineup.formation ?? 'Starting XI'}
							</p>
							{#if side.lineup.coach}<p class="mt-0.5 text-[10px] text-slate-500">Coach: {side.lineup.coach.name}</p>{/if}
							<ol class="mt-2 space-y-1.5">
								{#each side.lineup.startXI as player (player.id)}
									<li class="rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-800">
										<span class="font-semibold tabular-nums text-slate-500">{player.number ?? '–'}</span>
										<span class="ml-1">{player.name}</span>
										{#if player.position}<span class="ml-1 text-[9px] text-slate-400">{player.position}</span>{/if}
									</li>
								{/each}
							</ol>
						{:else}
							<p class="py-2 text-[10px] text-slate-400">Lineup not announced</p>
						{/if}

						<div class="mt-4 border-t border-slate-100 pt-3">
							<p class="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Absences</p>
							{#if side.injuries.length === 0}
								<p class="mt-1 text-[10px] text-slate-400">None reported</p>
							{:else}
								<ul class="mt-2 space-y-1.5">
									{#each side.injuries as injury (`${injury.team.id}-${injury.player.id}`)}
										<li class="rounded-md bg-amber-50 px-2 py-1.5">
											<p class="break-words text-[11px] font-semibold text-slate-900">{injury.player.name}</p>
											<p class="mt-0.5 break-words text-[10px] text-slate-500">{injuryDescription(injury)}</p>
											<p class="mt-1 text-[9px] font-semibold uppercase tracking-wide text-amber-700">{injury.player.type}</p>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					</div>
				</section>
			{/each}
		</div>
	</dialog>
{/if}
