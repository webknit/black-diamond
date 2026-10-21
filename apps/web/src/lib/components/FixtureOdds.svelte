<script lang="ts">
	import type { FixtureOddsData } from '../types/fixtureCard';

	let { odds }: { odds: FixtureOddsData | null } = $props();

	function oddsFor(marketNames: string[]) {
		const acceptedNames = marketNames.map((name) => name.toLowerCase());
		return odds?.odds.find((market) => acceptedNames.includes(market.name.toLowerCase()))
			?.values ?? [];
	}

	function goalSelections(direction: 'over' | 'under') {
		return oddsFor(['goals over/under', 'goals over under'])
			.filter((selection) => selection.value.toLowerCase().startsWith(direction))
			.sort((a, b) => {
				const threshold = (value: string) => Number(value.match(/\d+(?:\.\d+)?/)?.[0] ?? Infinity);
				return threshold(a.value) - threshold(b.value);
			});
	}

	function formatOddsLabel(value: string) {
		const normalized = value.toLowerCase();
		if (normalized === 'home') return 'H';
		if (normalized === 'draw') return 'D';
		if (normalized === 'away') return 'A';
		if (normalized === 'home/draw' || normalized === 'home or draw') return '1X';
		if (normalized === 'home/away' || normalized === 'home or away') return '12';
		if (normalized === 'draw/away' || normalized === 'draw or away') return 'X2';
		return value;
	}
</script>

<div class="mt-3 border-t border-slate-100 pt-3">
	{#if odds}
		<div class="space-y-2">
			{#each [
				{ title: '1X2', markets: ['match winner'] },
				{ title: 'Double chance', markets: ['double chance'] }
			] as market}
				<div class="min-w-0">
					<p class="mb-1 truncate text-center text-[9px] font-semibold uppercase tracking-wide text-slate-500">
						{market.title}
					</p>
					<div class="flex flex-wrap justify-evenly gap-1">
						{#each oddsFor(market.markets) as selection}
							<div class="flex min-w-0 items-center overflow-hidden rounded border border-slate-200 text-[10px] leading-5">
								<span class="truncate bg-slate-50 px-1.5 text-slate-600">
									{formatOddsLabel(selection.value)}
								</span>
								<span class="px-1.5 font-semibold tabular-nums text-slate-900">
									{selection.odd}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-2 space-y-2">
			{#each ['over', 'under'] as direction}
				<div class="min-w-0">
					<p class="mb-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
						Goals {direction}
					</p>
					<div class="overflow-x-auto pb-1">
						<div class="flex w-max flex-nowrap gap-1">
							{#each goalSelections(direction as 'over' | 'under') as selection}
								<div class="flex shrink-0 items-center overflow-hidden rounded border border-slate-200 text-[10px] leading-5">
									<span class="bg-slate-50 px-1.5 text-slate-600">
										{selection.value.replace(new RegExp(`^${direction}\\s*`, 'i'), '')}
									</span>
									<span class="px-1.5 font-semibold tabular-nums text-slate-900">
										{selection.odd}
									</span>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-2 min-w-0">
			<p class="mb-1 truncate text-[9px] font-semibold uppercase tracking-wide text-slate-500">
				Both teams score
			</p>
			<div class="flex flex-wrap gap-1">
				{#each oddsFor(['both teams score']) as selection}
					<div class="flex min-w-0 items-center overflow-hidden rounded border border-slate-200 text-[10px] leading-5">
						<span class="truncate bg-slate-50 px-1.5 text-slate-600">
							{formatOddsLabel(selection.value)}
						</span>
						<span class="px-1.5 font-semibold tabular-nums text-slate-900">
							{selection.odd}
						</span>
					</div>
				{/each}
			</div>
		</div>

		{#if odds.odds.length === 0}
			<p class="text-center text-[10px] text-slate-500">No market prices available.</p>
		{/if}
	{:else}
		<p class="text-center text-[10px] text-slate-500">Odds are not available yet.</p>
	{/if}
</div>
