<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function selectLeague(event: Event) {
		const select = event.currentTarget;
		if (select instanceof HTMLSelectElement) select.form?.requestSubmit();
	}
</script>

<svelte:head>
	<title>Black Diamond · League standings</title>
	<meta name="description" content="Current league tables for Black Diamond's selected leagues." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
					Black Diamond · Current season
				</p>
				<h1 class="mt-0.5 text-xl font-semibold tracking-tight text-slate-950 sm:mt-1 sm:text-3xl">
					League standings
				</h1>
			</div>

			{#if data.availableLeagues.length > 0}
				<form method="GET">
					<label for="league" class="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
						League
					</label>
					<select
						id="league"
						name="league"
						onchange={selectLeague}
						class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm sm:w-64"
					>
						{#each data.availableLeagues as league (league.id)}
							<option value={league.id} selected={league.id === data.standings?.league.id}>
								{league.country} · {league.name}
							</option>
						{/each}
					</select>
				</form>
			{/if}
		</header>

		{#if data.standings === null}
			<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
				<h2 class="text-lg font-semibold text-slate-950">No standings yet</h2>
				<p class="mt-2 text-sm text-slate-600">
					Run the daily sync to fetch standings for the selected leagues.
				</p>
			</section>
		{:else}
			{#each data.standings.league.standings as group, index}
				<section class:mt-5={index > 0}>
					{#if data.standings.league.standings.length > 1}
						<h2 class="mb-2 text-sm font-semibold text-slate-800">{group[0]?.group ?? `Group ${index + 1}`}</h2>
					{/if}
					<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
						<table class="min-w-[640px] w-full text-left text-xs">
							<thead class="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-500">
								<tr>
									<th scope="col" class="w-10 px-3 py-2 text-center">#</th>
									<th scope="col" class="px-2 py-2">Team</th>
									<th scope="col" class="px-2 py-2 text-right">P</th>
									<th scope="col" class="px-2 py-2 text-right">W</th>
									<th scope="col" class="px-2 py-2 text-right">D</th>
									<th scope="col" class="px-2 py-2 text-right">L</th>
									<th scope="col" class="px-2 py-2 text-right">GF</th>
									<th scope="col" class="px-2 py-2 text-right">GA</th>
									<th scope="col" class="px-2 py-2 text-right">GD</th>
									<th scope="col" class="px-3 py-2 text-right">Pts</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each group as team (team.team.id)}
									<tr class="hover:bg-slate-50">
										<td class="px-3 py-2 text-center font-semibold tabular-nums text-slate-500">{team.rank}</td>
										<th scope="row" class="min-w-44 px-2 py-2 font-medium text-slate-900">
											<div class="flex items-center gap-2">
												{#if team.team.logo}<img src={team.team.logo} alt="" class="size-5 object-contain" loading="lazy" />{/if}
												<span>{team.team.name}</span>
											</div>
										</th>
										<td class="px-2 py-2 text-right tabular-nums text-slate-700">{team.all.played}</td>
										<td class="px-2 py-2 text-right tabular-nums text-slate-700">{team.all.win}</td>
										<td class="px-2 py-2 text-right tabular-nums text-slate-700">{team.all.draw}</td>
										<td class="px-2 py-2 text-right tabular-nums text-slate-700">{team.all.lose}</td>
										<td class="px-2 py-2 text-right tabular-nums text-slate-700">{team.all.goals.for}</td>
										<td class="px-2 py-2 text-right tabular-nums text-slate-700">{team.all.goals.against}</td>
										<td class="px-2 py-2 text-right tabular-nums text-slate-700">{team.goalsDiff ?? '–'}</td>
										<td class="px-3 py-2 text-right font-bold tabular-nums text-slate-950">{team.points}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>
			{/each}
		{/if}
	</div>
</main>
