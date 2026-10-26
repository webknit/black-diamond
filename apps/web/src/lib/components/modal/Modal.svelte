<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte';

	let {
		isOpen = $bindable(true),
		label,
		onClose,
		children
	}: {
		isOpen?: boolean;
		label: string;
		onClose?: () => void;
		children: Snippet;
	} = $props();

	let dialogElement = $state<HTMLDialogElement>();

	function portal(node: HTMLElement) {
		document.body.append(node);
	}

	function notifyClosed() {
		isOpen = false;
		onClose?.();
	}

	function close() {
		if (dialogElement?.open) dialogElement.close();
		else notifyClosed();
	}

	function openDialog() {
		if (!isOpen || !dialogElement || dialogElement.open || !dialogElement.isConnected) return;
		dialogElement.showModal();
	}

	function closeFromDialogClick(event: MouseEvent) {
		const target = event.target;
		if (!(target instanceof Element)) return;

		if (target === dialogElement || target.closest('[data-modal-close]')) close();
	}

	onMount(openDialog);

	onDestroy(() => {
		if (dialogElement?.open) dialogElement.close();
	});

	$effect(() => {
		if (!isOpen) {
			if (dialogElement?.open) dialogElement.close();
			return;
		}

		openDialog();
	});
</script>

{#if isOpen}
	<dialog
		bind:this={dialogElement}
		use:portal
		aria-label={label}
		onclose={notifyClosed}
		oncancel={(event) => { event.preventDefault(); close(); }}
		onclick={closeFromDialogClick}
		class="fixed inset-0 z-50 m-auto flex max-h-[80dvh] w-[calc(100dvw-1rem)] max-w-[calc(100dvw-1rem)] flex-col overflow-hidden rounded-xl border-0 bg-white p-3 shadow-2xl backdrop:bg-slate-950/30 sm:max-w-2xl sm:p-4"
	>
		{@render children()}
	</dialog>
{/if}
