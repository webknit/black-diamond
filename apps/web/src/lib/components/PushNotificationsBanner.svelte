<script lang="ts">
	import { onMount } from 'svelte';

	let { hasPushSubscription }: { hasPushSubscription: boolean } = $props();
	let notificationsOff = $state(false);

	onMount(async () => {
		if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

		const registration = await navigator.serviceWorker.getRegistration();
		const browserSubscription = await registration?.pushManager.getSubscription();
		notificationsOff = !hasPushSubscription ||
			Notification.permission !== 'granted' ||
			!browserSubscription;
	});
</script>

{#if notificationsOff}
	<div class="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900" role="status">
		Fixture notifications are off. <a class="font-semibold underline underline-offset-2 hover:text-amber-950" href="/account">Enable them in Account</a>.
	</div>
{/if}
