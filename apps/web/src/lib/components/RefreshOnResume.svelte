<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		let wasHidden = false;

		function refreshWhenVisible() {
			if (document.visibilityState === 'hidden') {
				wasHidden = true;
				return;
			}

			if (!wasHidden) return;
			wasHidden = false;
			void refreshAll();
		}

		function refreshRestoredPage(event: PageTransitionEvent) {
			if (event.persisted) void refreshAll();
		}

		document.addEventListener('visibilitychange', refreshWhenVisible);
		window.addEventListener('pageshow', refreshRestoredPage);

		return () => {
			document.removeEventListener('visibilitychange', refreshWhenVisible);
			window.removeEventListener('pageshow', refreshRestoredPage);
		};
	});
</script>
