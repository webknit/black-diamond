<script lang="ts">
	let {
		date,
		onDateChange
	}: {
		date: string;
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
