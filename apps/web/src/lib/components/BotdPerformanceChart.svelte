<script lang="ts">
	type Series = { id: string; label: string; points: { date: string; profitLoss: number }[] };
	type Bucket = { key: string; label: string };
	type Line = { id: string; label: string; color: string; points: { key: string; value: number; x: number; y: number }[] };

	let { series }: { series: Series[] } = $props();
	let period = $state<'weeks' | 'months' | 'all'>('weeks');
	const colors = ['#4f46e5', '#64748b', '#e11d48', '#d97706', '#047857', '#7c3aed'];

	function toDate(value: string) { return new Date(`${value}T12:00:00.000Z`); }
	function weekStart(value: string) {
		const date = toDate(value);
		date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
		return date.toISOString().slice(0, 10);
	}
	function bucketKey(value: string) { return period === 'weeks' ? weekStart(value) : period === 'months' ? value.slice(0, 7) : value; }
	function bucketLabel(key: string) {
		if (period === 'months') return new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit', timeZone: 'Europe/London' }).format(toDate(`${key}-01`));
		if (period === 'weeks') return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/London' }).format(toDate(key));
		return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/London' }).format(toDate(key));
	}
	const buckets = $derived.by((): Bucket[] => {
		const keys = [...new Set(series.flatMap((line) => line.points.map((point) => bucketKey(point.date))))].sort();
		return keys.map((key) => ({ key, label: bucketLabel(key) }));
	});
	const lines = $derived.by((): Line[] => {
		const totals = series.map((line) => {
			const byBucket = new Map<string, number>();
			for (const point of line.points) {
				const key = bucketKey(point.date);
				byBucket.set(key, (byBucket.get(key) ?? 0) + point.profitLoss);
			}
			let runningTotal = 0;
			return { ...line, values: buckets.map((bucket) => { runningTotal += byBucket.get(bucket.key) ?? 0; return { key: bucket.key, value: runningTotal }; }) };
		});
		const values = totals.flatMap((line) => line.values.map((point) => point.value));
		const min = Math.min(0, ...values);
		const max = Math.max(0, ...values);
		const padding = Math.max((max - min) * 0.12, 1);
		const range = max - min + padding * 2;
		return totals.map((line, index) => ({ id: line.id, label: line.label, color: colors[index] ?? '#334155', points: line.values.map((point, pointIndex) => ({ ...point, x: 24 + (pointIndex / Math.max(buckets.length - 1, 1)) * 632, y: 20 + ((max + padding - point.value) / range) * 190 })) }));
	});
	const finalValues = $derived(lines.map((line) => ({ ...line, value: line.points.at(-1)?.value ?? 0 })));
</script>

<section class="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div><h2 class="text-sm font-semibold text-slate-950">Cumulative BOTD profit and loss</h2><p class="mt-0.5 text-xs text-slate-500">£1 flat stake per settled recommendation · all recorded BOTD history</p></div>
		<div class="inline-flex rounded-lg bg-slate-100 p-1" aria-label="Performance chart grouping">
			{#each [['weeks', 'Weeks'], ['months', 'Months'], ['all', 'All time']] as option (option[0])}
				<button type="button" class="rounded-md px-3 py-1.5 text-xs font-semibold" class:bg-white={period === option[0]} class:text-slate-950={period === option[0]} class:text-slate-600={period !== option[0]} aria-pressed={period === option[0]} onclick={() => (period = option[0] as typeof period)}>{option[1]}</button>
			{/each}
		</div>
	</div>
	{#if buckets.length > 0}
		<svg class="mt-4 h-56 w-full overflow-visible" viewBox="0 0 680 240" role="img" aria-label="Cumulative BOTD profit and loss graph">
			<line x1="24" y1="220" x2="656" y2="220" stroke="#cbd5e1" stroke-width="1" />
			{#each lines as line (line.id)}
				<polyline points={line.points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={line.color} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
			{/each}
		</svg>
		<div class="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs">
			{#each finalValues as line (line.id)}<span class="font-medium tabular-nums" style={`color: ${line.color}`}><span class="mr-1 inline-block size-2 rounded-full" style={`background-color: ${line.color}`}></span>{line.label}: {line.value >= 0 ? '+' : '-'}£{Math.abs(line.value).toFixed(2)}</span>{/each}
		</div>
		<div class="mt-3 flex justify-between gap-3 text-[10px] text-slate-500"><span>{buckets[0].label}</span><span>{buckets.at(-1)?.label}</span></div>
	{:else}
		<p class="mt-4 text-sm text-slate-600">No settled BOTD recommendations are available yet.</p>
	{/if}
</section>
