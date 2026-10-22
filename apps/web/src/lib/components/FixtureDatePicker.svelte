<script lang="ts">
	let {
		date,
		isLoading = false,
		onDateChange
	}: {
		date: string;
		isLoading?: boolean;
		onDateChange: (event: Event) => void;
	} = $props();
</script>

<form method="GET" class="flex items-end gap-2">
	<div>
		<label
			for="fixture-date"
			class="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500"
		>
			Choose date
		</label>
		<input
			id="fixture-date"
			name="date"
			type="date"
			value={date}
			onchange={onDateChange}
			class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
		/>
	</div>
</form>

{#if isLoading}
	<p class="flex items-center gap-2 text-xs font-medium text-slate-500" role="status">
		<span class="size-3 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700"></span>
		Loading fixtures…
	</p>
{/if}
