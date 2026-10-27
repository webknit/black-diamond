<script lang="ts">
	import { onMount } from 'svelte';

	type League = {
		id: number;
		name: string;
	};

	type CountryGroup = {
		country: string;
		leagues: League[];
	};

	let {
		groups,
		selectedLeagueCount,
		totalLeagueCount,
		isLeagueSelected,
		areAllCountryLeaguesSelected,
		areSomeCountryLeaguesSelected,
		onToggleLeague,
		onToggleCountry,
		onSelectAll,
		onDeselectAll,
		isOpen = $bindable(false)
	}: {
		groups: CountryGroup[];
		selectedLeagueCount: number;
		totalLeagueCount: number;
		isLeagueSelected: (leagueId: number) => boolean;
		areAllCountryLeaguesSelected: (leagueIds: number[]) => boolean;
		areSomeCountryLeaguesSelected: (leagueIds: number[]) => boolean;
		onToggleLeague: (leagueId: number, checked: boolean) => void;
		onToggleCountry: (leagueIds: number[], checked: boolean) => void;
		onSelectAll: () => void;
		onDeselectAll: () => void;
		isOpen?: boolean;
	} = $props();

	let filterDetails = $state<HTMLDetailsElement>();

	onMount(() => {
		function closeOnOutsideClick(event: PointerEvent) {
			if (filterDetails && event.target instanceof Node && !filterDetails.contains(event.target)) {
				isOpen = false;
			}
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') isOpen = false;
		}

		document.addEventListener('pointerdown', closeOnOutsideClick);
		document.addEventListener('keydown', closeOnEscape);

		return () => {
			document.removeEventListener('pointerdown', closeOnOutsideClick);
			document.removeEventListener('keydown', closeOnEscape);
		};
	});

	function indeterminateCheckbox(node: HTMLInputElement, indeterminate: boolean) {
		node.indeterminate = indeterminate;

		return {
			update(value: boolean) {
				node.indeterminate = value;
			}
		};
	}
</script>

<details bind:this={filterDetails} bind:open={isOpen} class="relative">
	<summary
		class="cursor-pointer list-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
	>
		Leagues
		<span class="ml-1 text-xs text-slate-500">{selectedLeagueCount}/{totalLeagueCount}</span>
	</summary>
	<div class="fixed inset-x-4 top-4 z-20 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[calc(100dvh-8rem)] sm:w-64">
		<div class="sticky top-0 z-10 -mx-3 -mt-3 mb-2 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-3 pb-3 pt-3">
			<div>
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Include leagues</p>
			<div class="mt-1.5 flex items-center gap-3">
				<button
					type="button"
					class="text-xs font-semibold text-slate-600 hover:text-slate-900"
					onclick={onDeselectAll}
				>
					Deselect all
				</button>
				<button
					type="button"
					class="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
					onclick={onSelectAll}
				>
					Select all
				</button>
			</div>
			</div>
			<button
				type="button"
				class="shrink-0 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
				onclick={() => (isOpen = false)}
				aria-label="Close league filter"
			>
				✕
			</button>
		</div>
		{#each groups as group, index (group.country)}
			<section class:mt-3={index > 0}>
				<label class="flex cursor-pointer items-center gap-2 rounded px-1 pb-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:text-slate-800">
					<input
						type="checkbox"
						checked={areAllCountryLeaguesSelected(group.leagues.map((league) => league.id))}
						use:indeterminateCheckbox={areSomeCountryLeaguesSelected(
							group.leagues.map((league) => league.id)
						)}
						onchange={(event) =>
							onToggleCountry(
								group.leagues.map((league) => league.id),
								event.currentTarget.checked
							)
						}
						class="size-3.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
					/>
					<span>{group.country}</span>
				</label>
				<div class="ml-1 border-l border-slate-200 pl-3">
					{#each group.leagues as league (league.id)}
						<label class="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
							<input
								type="checkbox"
								checked={isLeagueSelected(league.id)}
								onchange={(event) => onToggleLeague(league.id, event.currentTarget.checked)}
								class="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
							/>
							<span class="truncate">{league.name}</span>
						</label>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</details>
