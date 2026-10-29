<script lang="ts">
	import { onMount } from 'svelte';
	import Header from '#lib/components/Header.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	onMount(() => {
		if (!('serviceWorker' in navigator)) return;
		let reloadedForWorkerUpdate = false;
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			if (reloadedForWorkerUpdate) return;
			reloadedForWorkerUpdate = true;
			window.location.reload();
		});
		void navigator.serviceWorker.register(`/service-worker.js?v=${import.meta.env.VITE_BUILD_VERSION ?? 'local'}`);
	});
</script>

<svelte:head>
		<link rel="icon" href="/favicon.svg" />
		<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

<Header />

{@render children()}
