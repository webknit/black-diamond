<script lang="ts">
	import Header from '#lib/components/Header.svelte';
	import PushNotificationsBanner from '#lib/components/PushNotificationsBanner.svelte';
	import RefreshOnResume from '#lib/components/RefreshOnResume.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
		<link rel="icon" href="/favicon.svg" />
		<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

<Header />
{#if data.account}
	<PushNotificationsBanner hasPushSubscription={data.hasPushSubscription} />
{/if}
<RefreshOnResume />

{@render children()}
