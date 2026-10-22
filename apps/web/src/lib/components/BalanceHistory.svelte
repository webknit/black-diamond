<script lang="ts">
	import type { BalanceTransaction } from '@black-diamond/core/balanceTransaction';
	import { getUkDateKey } from '#lib/utils/time/getUkDateKey.js';

	type BetSummary = {
		id: string;
		selections: { homeTeamName: string; awayTeamName: string; market: string }[];
	};
	type Point = { key: string; label: string; balance: number | null };
	type PlottedPoint = Point & { x: number; y: number };

	let {
		transactions,
		bets,
		currentBalance,
		currency
	}: {
		transactions: BalanceTransaction[];
		bets: BetSummary[];
		currentBalance: number;
		currency: string;
	} = $props();

	let period = $state<'week' | 'year'>('week');
	let selectedKey = $state(getUkDateKey(new Date()));

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2
		}).format(value);
	}

	function getBucketKey(date: Date, view: 'week' | 'year'): string {
		const dateKey = getUkDateKey(date);
		return view === 'week' ? dateKey : dateKey.slice(0, 7);
	}

	function buildPoints(view: 'week' | 'year'): Point[] {
		const today = getUkDateKey(new Date());
		const buckets: { key: string; label: string }[] = [];
		if (view === 'week') {
			const date = new Date(`${today}T12:00:00.000Z`);
			date.setUTCDate(date.getUTCDate() - 6);
			for (let day = 0; day < 7; day++) {
				const key = date.toISOString().slice(0, 10);
				buckets.push({
					key,
					label: new Intl.DateTimeFormat('en-GB', {
						timeZone: 'Europe/London',
						weekday: 'short'
					}).format(date)
				});
				date.setUTCDate(date.getUTCDate() + 1);
			}
		} else {
			const currentMonth = new Date(`${today.slice(0, 7)}-01T12:00:00.000Z`);
			currentMonth.setUTCMonth(currentMonth.getUTCMonth() - 11);
			for (let month = 0; month < 12; month++) {
				const key = currentMonth.toISOString().slice(0, 7);
				buckets.push({
					key,
					label: new Intl.DateTimeFormat('en-GB', {
						timeZone: 'Europe/London',
						month: 'short',
						year: '2-digit'
					}).format(currentMonth)
				});
				currentMonth.setUTCMonth(currentMonth.getUTCMonth() + 1);
			}
		}

		if (transactions.length === 0) {
			const currentKey = view === 'week' ? today : today.slice(0, 7);
			return buckets.map((bucket) => ({
				...bucket,
				balance: bucket.key === currentKey ? currentBalance : null
			}));
		}

		const firstTransaction = transactions[0];
		const firstBucket = getBucketKey(new Date(firstTransaction.occurredAt), view);
		const precedingTransactions = transactions.filter(
			(transaction) => getBucketKey(new Date(transaction.occurredAt), view) < buckets[0].key
		);
		let previousBalance = precedingTransactions.at(-1)?.balanceAfter ?? null;

		return buckets.map((bucket) => {
			if (bucket.key >= firstBucket) {
				const bucketTransactions = transactions.filter(
					(transaction) =>
						getBucketKey(new Date(transaction.occurredAt), view) === bucket.key
				);
				if (bucketTransactions.length > 0) {
					previousBalance = bucketTransactions.at(-1)?.balanceAfter ?? previousBalance;
				}
			}
			return { ...bucket, balance: previousBalance };
		});
	}

	const points = $derived(buildPoints(period));
	const plottedPoints: PlottedPoint[] = $derived.by(() => {
		const knownPoints = points.filter((point) => point.balance !== null);
		if (knownPoints.length === 0) return [];

		const values = knownPoints.flatMap((point) =>
			point.balance === null ? [] : [point.balance]
		);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const padding = Math.max((max - min) * 0.12, 1);
		const range = max - min + padding * 2;

		return points.flatMap((point, index) =>
			point.balance === null
				? []
				: [{
						...point,
						x: 24 + (index / Math.max(points.length - 1, 1)) * 632,
						y: 20 + ((max + padding - point.balance) / range) * 190
					}]
		);
	});
	const linePoints = $derived(plottedPoints.map(({ x, y }) => `${x},${y}`).join(' '));
	const selectedTransactions = $derived(
		transactions.filter(
			(transaction) => getBucketKey(new Date(transaction.occurredAt), period) === selectedKey
		)
	);
	const betsById = $derived(new Map(bets.map((bet) => [bet.id, bet])));

	function selectPeriod(nextPeriod: 'week' | 'year') {
		period = nextPeriod;
		const today = getUkDateKey(new Date());
		selectedKey = nextPeriod === 'week' ? today : today.slice(0, 7);
	}

	function transactionLabel(transaction: BalanceTransaction): string {
		if (transaction.type === 'opening_balance') return 'Opening balance';
		if (transaction.type === 'deposit') return 'Deposit';
		if (transaction.type === 'bet_stake') return 'Bet stake';
		if (transaction.type === 'bet_payout') return 'Bet payout';
		if (transaction.type === 'bet_reversal') return 'Bet reversal';
		return 'Balance adjustment';
	}

	function betDescription(transaction: BalanceTransaction): string | null {
		if (!transaction.referenceId) return null;
		const bet = betsById.get(transaction.referenceId);
		if (!bet) return `Bet ${transaction.referenceId.slice(0, 8)}`;
		return bet.selections
			.map((selection) => `${selection.homeTeamName} v ${selection.awayTeamName} · ${selection.market}`)
			.join(', ');
	}
</script>

<section class="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-sm font-semibold text-slate-950">Balance history</h2>
			<p class="mt-0.5 text-xs text-slate-500">Closing balance · UK time</p>
		</div>
		<div class="inline-flex rounded-lg bg-slate-100 p-1" aria-label="Graph period">
			<button
				type="button"
				class="rounded-md px-3 py-1.5 text-xs font-semibold"
				class:bg-white={period === 'week'}
				class:text-slate-950={period === 'week'}
				class:text-slate-600={period !== 'week'}
				aria-pressed={period === 'week'}
				onclick={() => selectPeriod('week')}>Week</button
			>
			<button
				type="button"
				class="rounded-md px-3 py-1.5 text-xs font-semibold"
				class:bg-white={period === 'year'}
				class:text-slate-950={period === 'year'}
				class:text-slate-600={period !== 'year'}
				aria-pressed={period === 'year'}
				onclick={() => selectPeriod('year')}>Year</button
			>
		</div>
	</div>

	{#if plottedPoints.length > 0}
		<svg class="mt-4 h-56 w-full overflow-visible" viewBox="0 0 680 240" role="img" aria-label="Balance history graph">
			<line x1="24" y1="220" x2="656" y2="220" stroke="#cbd5e1" stroke-width="1" />
			{#if plottedPoints.length > 1}
				<polyline points={linePoints} fill="none" stroke="#047857" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
			{/if}
			{#each plottedPoints as point (point.key)}
				<circle cx={point.x} cy={point.y} r="4" fill="#047857" />
			{/each}
		</svg>
		<div class="grid gap-1" class:grid-cols-7={period === 'week'} class:grid-cols-6={period === 'year'}>
			{#each points as point (point.key)}
				<button
					type="button"
					class="rounded-md px-1 py-2 text-center hover:bg-slate-50"
					class:bg-emerald-50={selectedKey === point.key}
					aria-pressed={selectedKey === point.key}
					onclick={() => (selectedKey = point.key)}
				>
					<span class="block text-[10px] text-slate-500">{point.label}</span>
					<span class="mt-0.5 block truncate text-[10px] font-semibold tabular-nums text-slate-800">
						{point.balance === null ? '–' : formatCurrency(point.balance)}
					</span>
				</button>
			{/each}
		</div>
	{:else}
		<p class="mt-4 text-sm text-slate-600">No balance history is available yet.</p>
	{/if}

	<div class="mt-4 border-t border-slate-100 pt-3">
		<h3 class="text-xs font-semibold text-slate-800">
			{period === 'week' ? 'Activity on selected day' : 'Activity in selected month'}
		</h3>
		{#if selectedTransactions.length > 0}
			<ul class="mt-2 space-y-2">
				{#each selectedTransactions as transaction (transaction.id)}
					<li class="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs">
						<span class="min-w-0 text-slate-700">
							{transactionLabel(transaction)}
							{#if betDescription(transaction)}
								<span class="text-slate-500">· {betDescription(transaction)}</span>
							{/if}
						</span>
						<span class="shrink-0 font-medium tabular-nums" class:text-emerald-700={transaction.amount >= 0} class:text-rose-700={transaction.amount < 0}>
							{transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
						</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-2 text-xs text-slate-500">No balance changes in this period.</p>
		{/if}
	</div>
</section>
