<script lang="ts">
	let { showFinished = $bindable(false) }: { showFinished?: boolean } = $props();
</script>

<label class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
	<input
		type="checkbox"
		bind:checked={showFinished}
		class="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
	/>
	<span>Show FT</span>
</label>
