<script lang="ts">
	import Header from '#lib/components/Header.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
		<link rel="icon" href="/favicon.svg" />
		<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

<Header />

{@render children()}
