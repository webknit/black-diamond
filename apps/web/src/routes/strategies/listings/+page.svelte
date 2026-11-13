<script lang="ts">
	import History from '../[market]/[strategyId]/+page.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<History {data} />
