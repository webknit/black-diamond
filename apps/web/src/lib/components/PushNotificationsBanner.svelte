<script lang="ts">
	import { onMount } from 'svelte';

	let { hasPushSubscription }: { hasPushSubscription: boolean } = $props();
	let notificationsOff = $state(false);

	onMount(() => {
		function updateNotificationState(event: Event) {
			if (event instanceof CustomEvent && typeof event.detail === 'boolean') {
				notificationsOff = !event.detail;
			}
		}

		window.addEventListener('push-notifications-changed', updateNotificationState);
		if ('Notification' in window && 'serviceWorker' in navigator) {
			void navigator.serviceWorker.getRegistration().then(async (registration) => {
				const browserSubscription = await registration?.pushManager.getSubscription();
				notificationsOff = !hasPushSubscription ||
					Notification.permission !== 'granted' ||
					!browserSubscription;
			});
		}
		return () => window.removeEventListener('push-notifications-changed', updateNotificationState);
	});
</script>

{#if notificationsOff}
	<div class="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900" role="status">
		Fixture notifications are off. <a class="font-semibold underline underline-offset-2 hover:text-amber-950" href="/account">Enable them in Account</a>.
	</div>
{/if}
