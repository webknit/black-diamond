<script lang="ts">
	import type { BalanceTransaction } from '@black-diamond/core/balanceTransaction';
	import { getUkDateKey } from '#lib/utils/time/getUkDateKey.js';

	type BetSummary = {
		id: string;
		stake: number;
		status: 'pending' | 'won' | 'lost' | 'void';
		profit: number | null;
		placedAt: string;
		settledAt: string | null;
		selections: { homeTeamName: string; awayTeamName: string; market: string }[];
	};
	type Point = { key: string; label: string; balance: number | null; asOf: string | null };
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

	let period = $state<'days' | 'weeks' | 'month' | 'year'>('days');
	let selectedKey = $state(getUkDateKey(new Date()));

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2
		}).format(value);
	}

	function ordinal(day: number) {
		const remainder = day % 100;
		if (remainder >= 11 && remainder <= 13) return `${day}th`;
		return `${day}${day % 10 === 1 ? 'st' : day % 10 === 2 ? 'nd' : day % 10 === 3 ? 'rd' : 'th'}`;
	}

	function formatDayLabel(date: Date) {
		const weekday = new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/London',
			weekday: 'short'
		}).format(date);
		const month = new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/London',
			month: 'short'
		}).format(date);
		return `${weekday} ${ordinal(date.getUTCDate())} ${month}`;
	}

	function getWeekStartKey(date: Date) {
		const dateKey = getUkDateKey(date);
		const weekStart = new Date(`${dateKey}T12:00:00.000Z`);
		weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
		return weekStart.toISOString().slice(0, 10);
	}

	function formatWeekRange(weekStart: Date) {
		const weekEnd = new Date(weekStart);
		weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
		const formatter = new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/London',
			day: 'numeric',
			month: 'short'
		});
		return `${formatter.format(weekStart)} – ${formatter.format(weekEnd)}`;
	}

	function getBucketKey(date: Date, view: 'days' | 'weeks' | 'month' | 'year'): string {
		const dateKey = getUkDateKey(date);
		if (view === 'days') return dateKey;
		if (view === 'weeks') return getWeekStartKey(date);
		if (view === 'month') return dateKey.slice(0, 7);
		return dateKey.slice(0, 4);
	}

	function getBankrollAt(balance: number, asOf: string): number {
		const asOfTimestamp = new Date(asOf).getTime();
		const outstandingStake = bets.reduce((total, bet) => {
			const wasPlaced = new Date(bet.placedAt).getTime() <= asOfTimestamp;
			const wasUnsettled = bet.settledAt === null || new Date(bet.settledAt).getTime() > asOfTimestamp;
			return wasPlaced && wasUnsettled ? total + bet.stake : total;
		}, 0);

		return balance + outstandingStake;
	}

	function buildPoints(view: 'days' | 'weeks' | 'month' | 'year'): Point[] {
		const today = getUkDateKey(new Date());
		const buckets: { key: string; label: string }[] = [];
		if (view === 'days') {
			const date = new Date(`${today}T12:00:00.000Z`);
			date.setUTCDate(date.getUTCDate() - 6);
			for (let day = 0; day < 7; day++) {
				const key = date.toISOString().slice(0, 10);
				buckets.push({
					key,
					label: formatDayLabel(date)
				});
				date.setUTCDate(date.getUTCDate() + 1);
			}
		} else if (view === 'weeks') {
			const date = new Date(`${getWeekStartKey(new Date())}T12:00:00.000Z`);
			date.setUTCDate(date.getUTCDate() - 9 * 7);
			for (let week = 0; week < 10; week++) {
				buckets.push({
					key: date.toISOString().slice(0, 10),
					label: formatWeekRange(date)
				});
				date.setUTCDate(date.getUTCDate() + 7);
			}
		} else if (view === 'month') {
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
		} else {
			const firstYear = transactions[0]
				? Number(getUkDateKey(new Date(transactions[0].occurredAt)).slice(0, 4))
				: Number(today.slice(0, 4));
			const currentYear = Number(today.slice(0, 4));
			for (let year = firstYear; year <= currentYear; year++) {
				buckets.push({ key: String(year), label: String(year) });
			}
		}

		if (transactions.length === 0) {
			const currentKey = view === 'days' ? today : view === 'weeks' ? getWeekStartKey(new Date()) : view === 'month' ? today.slice(0, 7) : today.slice(0, 4);
			return buckets.map((bucket) => ({
				...bucket,
				balance: bucket.key === currentKey ? getBankrollAt(currentBalance, new Date().toISOString()) : null,
				asOf: bucket.key === currentKey ? new Date().toISOString() : null
			}));
		}

		const firstTransaction = transactions[0];
		const firstBucket = getBucketKey(new Date(firstTransaction.occurredAt), view);
		const precedingTransactions = transactions.filter(
			(transaction) => getBucketKey(new Date(transaction.occurredAt), view) < buckets[0].key
		);
		let previousBalance = precedingTransactions.at(-1)?.balanceAfter ?? null;
		let previousBalanceAt = precedingTransactions.at(-1)?.occurredAt ?? null;

		return buckets.map((bucket) => {
			if (bucket.key >= firstBucket) {
				const bucketTransactions = transactions.filter(
					(transaction) =>
						getBucketKey(new Date(transaction.occurredAt), view) === bucket.key
				);
				if (bucketTransactions.length > 0) {
					const latestTransaction = bucketTransactions.at(-1)!;
					previousBalance = latestTransaction.balanceAfter;
					previousBalanceAt = latestTransaction.occurredAt;
				}
			}
			return {
				...bucket,
				balance:
					previousBalance === null || previousBalanceAt === null
						? null
						: getBankrollAt(previousBalance, previousBalanceAt),
				asOf: previousBalanceAt
			};
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
	const selectedBets = $derived(
		bets.filter((bet) => getBucketKey(new Date(bet.placedAt), period) === selectedKey)
	);
	const selectedStake = $derived(selectedBets.reduce((total, bet) => total + bet.stake, 0));
	const selectedSettledBets = $derived(
		bets.filter(
			(bet) =>
				bet.settledAt !== null &&
				getBucketKey(new Date(bet.settledAt), period) === selectedKey &&
				bet.profit !== null
		)
	);
	const selectedProfit = $derived(
		selectedSettledBets.reduce((total, bet) => total + (bet.profit ?? 0), 0)
	);
	const betsById = $derived(new Map(bets.map((bet) => [bet.id, bet])));

	function selectPeriod(nextPeriod: 'days' | 'weeks' | 'month' | 'year') {
		period = nextPeriod;
		const today = getUkDateKey(new Date());
		selectedKey = nextPeriod === 'days' ? today : nextPeriod === 'weeks' ? getWeekStartKey(new Date()) : nextPeriod === 'month' ? today.slice(0, 7) : today.slice(0, 4);
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
			<p class="mt-0.5 text-xs text-slate-500">Bankroll, including outstanding stakes · UK time</p>
		</div>
		<div class="inline-flex rounded-lg bg-slate-100 p-1" aria-label="Graph period">
			<button
				type="button"
				class="rounded-md px-3 py-1.5 text-xs font-semibold"
				class:bg-white={period === 'days'}
				class:text-slate-950={period === 'days'}
				class:text-slate-600={period !== 'days'}
				aria-pressed={period === 'days'}
				onclick={() => selectPeriod('days')}>Days</button
			>
			<button
				type="button"
				class="rounded-md px-3 py-1.5 text-xs font-semibold"
				class:bg-white={period === 'weeks'}
				class:text-slate-950={period === 'weeks'}
				class:text-slate-600={period !== 'weeks'}
				aria-pressed={period === 'weeks'}
				onclick={() => selectPeriod('weeks')}>Weeks</button
			>
			<button
				type="button"
				class="rounded-md px-3 py-1.5 text-xs font-semibold"
				class:bg-white={period === 'month'}
				class:text-slate-950={period === 'month'}
				class:text-slate-600={period !== 'month'}
				aria-pressed={period === 'month'}
				onclick={() => selectPeriod('month')}>Month</button
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
		<div class="grid gap-1" class:grid-cols-7={period === 'days'} class:grid-cols-5={period === 'weeks'} class:grid-cols-6={period === 'month'} class:grid-cols-4={period === 'year'}>
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
			{period === 'days' ? 'Activity on selected day' : period === 'weeks' ? 'Activity in selected week' : period === 'month' ? 'Activity in selected month' : 'Activity in selected year'}
		</h3>
		<div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Selected period summary">
			<div class="rounded-md bg-slate-50 px-2.5 py-2">
				<p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Bets placed</p>
				<p class="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">{selectedBets.length}</p>
			</div>
			<div class="rounded-md bg-slate-50 px-2.5 py-2">
				<p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Staked</p>
				<p class="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">{formatCurrency(selectedStake)}</p>
			</div>
			<div class="rounded-md bg-slate-50 px-2.5 py-2">
				<p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Settled P/L</p>
				<p class="mt-0.5 text-sm font-semibold tabular-nums" class:text-emerald-700={selectedProfit >= 0} class:text-rose-700={selectedProfit < 0}>{selectedSettledBets.length === 0 ? '–' : formatCurrency(selectedProfit)}</p>
			</div>
		</div>
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
