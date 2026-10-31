<script lang="ts">
	import Header from '#lib/components/Header.svelte';
	import RefreshOnResume from '#lib/components/RefreshOnResume.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
		<link rel="icon" href="/favicon.svg" />
		<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

<Header />
<RefreshOnResume />

{@render children()}
