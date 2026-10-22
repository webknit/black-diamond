<script lang="ts">
	import { enhance } from '$app/forms';
	import type { FixtureCardData, FixtureOddSelection } from '../types/fixtureCard';

	export type BetSlipSelection = {
	fixture: FixtureCardData;
	selection: FixtureOddSelection;
};

	let {
		selections,
		date,
		balance,
		currency,
		onRemove,
		onClose,
		onPlaced
	}: {
		selections: BetSlipSelection[];
		date: string;
		balance: number;
		currency: string;
		onRemove: (index: number) => void;
		onClose: () => void;
		onPlaced: () => void;
	} = $props();

	let stake = $state('');
	let isUnmatched = $state(false);
	let placedOdds = $state('');
	let hasEditedPlacedOdds = $state(false);
	let betError = $state<string | null>(null);
	const combinedOdds = $derived(
		selections.every((item) => item.selection.odd !== null)
			? selections.reduce((total, item) => total * Number(item.selection.odd), 1)
			: null
	);
	const currencyFormatter = $derived(
		new Intl.NumberFormat('en-GB', { style: 'currency', currency, minimumFractionDigits: 2 })
	);
	const potentialReturn = $derived(
		Number(stake) > 0 && Number(placedOdds) > 1 ? Number(stake) * Number(placedOdds) : null
	);

	$effect(() => {
		if (!hasEditedPlacedOdds) placedOdds = combinedOdds?.toFixed(2) ?? '';
	});
</script>

<aside class="fixed bottom-4 left-1/2 z-40 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl" aria-label="Bet slip">
	<div class="flex items-center justify-between gap-3">
		<h2 class="text-sm font-semibold text-slate-950">
			Bet slip <span class="text-slate-500">({selections.length})</span>
		</h2>
		<button type="button" class="text-xs font-medium text-slate-500 hover:text-slate-950" onclick={onClose}>
			Close
		</button>
	</div>

	<div class="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1">
		{#each selections as item, index (`${item.fixture.id}-${item.selection.marketName}-${item.selection.value}`)}
			<div class="rounded-lg bg-slate-50 px-2.5 py-2 text-xs">
				<div class="flex gap-2">
					<p class="min-w-0 flex-1 truncate font-medium text-slate-900">
						{item.fixture.homeTeamName} v {item.fixture.awayTeamName}
					</p>
					<button type="button" class="text-slate-500 hover:text-rose-700" aria-label="Remove selection" onclick={() => onRemove(index)}>×</button>
				</div>
				<p class="mt-0.5 flex justify-between gap-2 text-slate-600">
					<span class="truncate">{item.selection.value}</span>
					<strong class="tabular-nums text-slate-900">{item.selection.odd ?? '–'}</strong>
				</p>
			</div>
		{/each}
	</div>

	<form
		method="POST"
		action="?/placeBet"
		class="mt-3 space-y-2"
		use:enhance={() => {
			betError = null;
			return async ({ result, update }) => {
				if (result.type === 'failure') {
					betError = (result.data as { betError?: string }).betError ?? 'Unable to place this bet.';
					return;
				}
				onPlaced();
				await update();
			};
		}}
	>
		<input type="hidden" name="selections" value={JSON.stringify(selections.map(({ fixture, selection }) => ({ fixtureId: fixture.id, ...selection })))} />
		<input type="hidden" name="date" value={date} />

		{#if selections.length > 1 && combinedOdds !== null}
			<div class="flex items-center justify-between text-xs">
				<span class="text-slate-600">Reference combined odds</span>
				<strong class="tabular-nums text-slate-950">{combinedOdds.toFixed(2)}</strong>
			</div>
		{/if}
		<div class="grid grid-cols-2 gap-2">
			<label class="text-xs font-medium text-slate-700">
				<span>Odds</span>
				<input class="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm tabular-nums outline-none focus:border-emerald-600" name="placedOdds" type="number" min="1.01" step="0.01" inputmode="decimal" placeholder="0.00" bind:value={placedOdds} oninput={() => (hasEditedPlacedOdds = true)} required />
			</label>
			<label class="text-xs font-medium text-slate-700">
				<span>Stake</span>
				<input class="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm tabular-nums outline-none focus:border-emerald-600" name="stake" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0.00" bind:value={stake} required />
			</label>
		</div>
		<label class="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" name="isUnmatched" bind:checked={isUnmatched} /> Unmatched — do not settle yet</label>
		<div class="flex justify-between text-[11px] text-slate-500">
			<span>Available {currencyFormatter.format(balance)}</span>
			{#if potentialReturn !== null}<span>Return {currencyFormatter.format(potentialReturn)}</span>{/if}
		</div>
		{#if betError}<p class="rounded-md bg-rose-50 px-2 py-1.5 text-xs text-rose-700" role="alert">{betError}</p>{/if}
		<button class="w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
			Place {selections.length === 1 ? 'single' : `${selections.length}-fold`}
		</button>
	</form>
</aside>
