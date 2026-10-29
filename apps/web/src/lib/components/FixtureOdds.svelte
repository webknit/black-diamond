<script lang="ts">
	import type { FixtureOddsData, FixtureOddSelection } from '../types/fixtureCard';

	let {
		odds,
		fixtureId,
		placedSelectionKeys = [],
		onSelectOdd,
		recommendedMarket
	}: {
		odds: FixtureOddsData | null;
		fixtureId: number;
		placedSelectionKeys?: string[];
		onSelectOdd?: (selection: FixtureOddSelection) => void;
		recommendedMarket?: string | null;
	} = $props();

	type OddsSelection = { value: string; odd: string | null };

	function selectionKey(value: string) {
		return value.toLowerCase().replaceAll(' or ', '/').replaceAll(' ', '');
	}

	function oddsFor(marketNames: string[], fallbackSelections: string[] = []): OddsSelection[] {
		const acceptedNames = marketNames.map((name) => name.toLowerCase());
		const values = odds?.odds.find((market) => acceptedNames.includes(market.name.toLowerCase()))?.values ?? [];
		if (fallbackSelections.length === 0) return values;

		const valuesBySelection = new Map(values.map((selection) => [selectionKey(selection.value), selection]));
		const fallbackKeys = new Set(fallbackSelections.map(selectionKey));
		return [
			...fallbackSelections.map((value) => valuesBySelection.get(selectionKey(value)) ?? { value, odd: null }),
			...values.filter((selection) => !fallbackKeys.has(selectionKey(selection.value)))
		];
	}

	function goalSelections(direction: 'over' | 'under') {
		return oddsFor(['goals over/under', 'goals over under'], [
			'Over 0.5', 'Over 1.5', 'Over 2.5', 'Over 3.5', 'Over 4.5', 'Over 5.5',
			'Under 0.5', 'Under 1.5', 'Under 2.5', 'Under 3.5', 'Under 4.5', 'Under 5.5'
		])
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

	function selectOdd(marketNames: string[], selection: OddsSelection) {
		const acceptedNames = marketNames.map((name) => name.toLowerCase());
		const marketName = odds?.odds.find((market) => acceptedNames.includes(market.name.toLowerCase()))?.name ?? marketNames[0];
		onSelectOdd?.({ marketName, value: selection.value, odd: selection.odd });
	}

	function isPlaced(marketNames: string[], selection: OddsSelection) {
		const marketName = odds?.odds.find((market) => marketNames.includes(market.name.toLowerCase()))?.name ?? marketNames[0];
		return placedSelectionKeys.includes(`${fixtureId}|${marketName.toLowerCase()}|${selection.value.toLowerCase()}`);
	}

	function isRecommended(marketNames: string[], selection: OddsSelection) {
		if (isPlaced(marketNames, selection)) return false;

		const selectionValue = selection.value.trim().toLowerCase();
		const isGoalsMarket = marketNames.includes('goals over/under') || marketNames.includes('goals over under');
		const isBttsMarket = marketNames.includes('both teams score');
		return (recommendedMarket === 'over2_5' && isGoalsMarket && selectionValue === 'over 2.5') ||
			(recommendedMarket === 'over1_5' && isGoalsMarket && selectionValue === 'over 1.5') ||
			(recommendedMarket === 'btts' && isBttsMarket && selectionValue === 'yes') ||
			(recommendedMarket === 'bttns' && isBttsMarket && selectionValue === 'no');
	}
</script>

<div class="mt-3 border-t border-slate-100 pt-3">
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
						{#each oddsFor(market.markets, market.title === '1X2' ? ['Home', 'Draw', 'Away'] : ['Home/Draw', 'Home/Away', 'Draw/Away']) as selection}
							<button type="button" onclick={() => selectOdd(market.markets, selection)} class="flex min-w-0 items-center overflow-hidden rounded border border-slate-200 text-[10px] leading-5 transition hover:border-emerald-500 hover:bg-emerald-50" class:border-emerald-300={isPlaced(market.markets, selection)} class:bg-emerald-100={isPlaced(market.markets, selection)} class:border-indigo-600={isRecommended(market.markets, selection)} class:bg-indigo-50={isRecommended(market.markets, selection)} style:box-shadow={isRecommended(market.markets, selection) ? 'inset 0 0 0 2px rgb(79 70 229)' : undefined}>
								<span class={`truncate border-r px-1.5 text-slate-600 ${isPlaced(market.markets, selection) ? 'border-emerald-200 bg-emerald-100' : isRecommended(market.markets, selection) ? 'border-indigo-200 bg-indigo-100' : 'border-slate-200 bg-slate-50'}`}>
									{formatOddsLabel(selection.value)}
								</span>
								<span class="px-1.5 font-semibold tabular-nums text-slate-900" class:bg-indigo-100={isRecommended(market.markets, selection)}>
									{selection.odd ?? '–'}
								</span>
							</button>
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
								<button type="button" onclick={() => selectOdd(['goals over/under', 'goals over under'], selection)} class="flex shrink-0 items-center overflow-hidden rounded border border-slate-200 text-[10px] leading-5 transition hover:border-emerald-500 hover:bg-emerald-50" class:border-emerald-300={isPlaced(['goals over/under', 'goals over under'], selection)} class:bg-emerald-100={isPlaced(['goals over/under', 'goals over under'], selection)} class:border-indigo-600={isRecommended(['goals over/under', 'goals over under'], selection)} class:bg-indigo-50={isRecommended(['goals over/under', 'goals over under'], selection)} style:box-shadow={isRecommended(['goals over/under', 'goals over under'], selection) ? 'inset 0 0 0 2px rgb(79 70 229)' : undefined}>
									<span class={`border-r px-1.5 text-slate-600 ${isPlaced(['goals over/under', 'goals over under'], selection) ? 'border-emerald-300 bg-emerald-100' : isRecommended(['goals over/under', 'goals over under'], selection) ? 'border-indigo-200 bg-indigo-100' : 'border-slate-200 bg-slate-50'}`}>
										{selection.value.replace(new RegExp(`^${direction}\\s*`, 'i'), '')}
									</span>
									<span class="px-1.5 font-semibold tabular-nums text-slate-900" class:bg-indigo-100={isRecommended(['goals over/under', 'goals over under'], selection)}>
									{selection.odd ?? '–'}
									</span>
								</button>
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
				{#each oddsFor(['both teams score'], ['Yes', 'No']) as selection}
					<button type="button" onclick={() => selectOdd(['both teams score'], selection)} class="flex min-w-0 items-center overflow-hidden rounded border border-slate-200 text-[10px] leading-5 transition hover:border-emerald-500 hover:bg-emerald-50" class:border-emerald-300={isPlaced(['both teams score'], selection)} class:bg-emerald-100={isPlaced(['both teams score'], selection)} class:border-indigo-600={isRecommended(['both teams score'], selection)} class:bg-indigo-50={isRecommended(['both teams score'], selection)} style:box-shadow={isRecommended(['both teams score'], selection) ? 'inset 0 0 0 2px rgb(79 70 229)' : undefined}>
						<span class={`truncate border-r px-1.5 text-slate-600 ${isPlaced(['both teams score'], selection) ? 'border-emerald-300 bg-emerald-100' : isRecommended(['both teams score'], selection) ? 'border-indigo-200 bg-indigo-100' : 'border-slate-200 bg-slate-50'}`}>
							{formatOddsLabel(selection.value)}
						</span>
						<span class="px-1.5 font-semibold tabular-nums text-slate-900" class:bg-indigo-100={isRecommended(['both teams score'], selection)}>
							{selection.odd ?? '–'}
						</span>
					</button>
				{/each}
			</div>
	</div>
</div>
