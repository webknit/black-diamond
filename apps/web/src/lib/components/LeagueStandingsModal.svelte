<script lang="ts">
	import type { LeagueStandings } from '@black-diamond/core/leagueStandings';

	let {
		leagueId,
		season,
		leagueName,
		highlightedTeamIds,
		isOpen = $bindable(false)
	}: {
		leagueId: number;
		season: number;
		leagueName: string;
		highlightedTeamIds: number[];
		isOpen?: boolean;
	} = $props();

	let standings = $state<LeagueStandings | null>(null);
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);
	let loadedKey = $state<string | null>(null);

	$effect(() => {
		if (!isOpen) return;

		const requestKey = `${leagueId}:${season}`;
		if (loadedKey === requestKey) return;

		loadedKey = requestKey;
		standings = null;
		errorMessage = null;
		isLoading = true;

		void fetch(`/api/league-standings/${leagueId}/${season}`)
			.then(async (response) => {
				if (!response.ok) throw new Error('League standings are unavailable.');
				standings = await response.json() as LeagueStandings | null;
			})
			.catch((error: unknown) => {
				errorMessage = error instanceof Error ? error.message : 'League standings are unavailable.';
			})
			.finally(() => {
				isLoading = false;
			});
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 z-40 bg-slate-950/30" role="presentation" onclick={() => (isOpen = false)}></div>
	<dialog open class="fixed inset-x-3 top-1/2 z-50 mx-auto max-h-[75vh] max-w-3xl -translate-y-1/2 overflow-y-auto rounded-xl border-0 bg-white p-4 shadow-2xl" aria-label={`${leagueName} league table`}>
		<header class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
			<div>
				<p class="text-sm font-semibold text-slate-950">{standings?.league.name ?? leagueName}</p>
				<p class="mt-0.5 text-xs text-slate-500">{standings?.league.country ?? ''} · {season} season</p>
			</div>
			<button type="button" class="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close league table" onclick={() => (isOpen = false)}>✕</button>
		</header>

		{#if isLoading}
			<div class="flex items-center justify-center py-12 text-sm text-slate-500">
				<span class="mr-2 size-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600"></span>
				Loading table…
			</div>
		{:else if errorMessage}
			<p class="py-10 text-center text-sm text-rose-700">{errorMessage}</p>
		{:else if standings === null}
			<p class="py-10 text-center text-sm text-slate-500">No league table is available yet.</p>
		{:else}
			{#each standings.league.standings as group, index}
				<section class:mt-5={index > 0}>
					{#if standings.league.standings.length > 1}
						<h2 class="mb-2 text-xs font-semibold text-slate-700">{group[0]?.group ?? `Group ${index + 1}`}</h2>
					{/if}
					<div class="overflow-x-auto rounded-lg border border-slate-200">
						<table class="min-w-[520px] w-full text-left text-xs">
							<thead class="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-500">
								<tr>
									<th scope="col" class="w-9 px-2 py-2 text-center">#</th>
									<th scope="col" class="min-w-32 px-2 py-2">Team</th>
									<th scope="col" class="px-2 py-2 text-right">P</th>
									<th scope="col" class="px-2 py-2 text-right">W</th>
									<th scope="col" class="px-2 py-2 text-right">D</th>
									<th scope="col" class="px-2 py-2 text-right">L</th>
									<th scope="col" class="px-2 py-2 text-right">GD</th>
									<th scope="col" class="px-3 py-2 text-right">Pts</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each group as team (team.team.id)}
									<tr class:bg-emerald-50={highlightedTeamIds.includes(team.team.id)} class:font-semibold={highlightedTeamIds.includes(team.team.id)}>
										<td class="px-2 py-2 text-center tabular-nums text-slate-500">{team.rank}</td>
										<th scope="row" class="px-2 py-2 font-medium text-slate-900">
											<div class="flex min-w-0 items-center gap-2">
												{#if team.team.logo}<img src={team.team.logo} alt="" class="size-5 object-contain" loading="lazy" />{/if}
												<span class="truncate">{team.team.name}</span>
											</div>
										</th>
										<td class="px-2 py-2 text-right tabular-nums">{team.all.played}</td>
										<td class="px-2 py-2 text-right tabular-nums">{team.all.win}</td>
										<td class="px-2 py-2 text-right tabular-nums">{team.all.draw}</td>
										<td class="px-2 py-2 text-right tabular-nums">{team.all.lose}</td>
										<td class="px-2 py-2 text-right tabular-nums">{team.goalsDiff ?? '–'}</td>
										<td class="px-3 py-2 text-right font-bold tabular-nums">{team.points}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>
			{/each}
		{/if}
	</dialog>
{/if}
