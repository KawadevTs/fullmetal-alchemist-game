<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { DESIGN_W, DESIGN_H } from '$lib/gameConfig';

	let { children }: { children: Snippet } = $props();

	let ready = $state<boolean>(false);
	let stageStyle = $state<string>('');

	function recalcScale(): void {
		const w: number = window.innerWidth;
		const h: number = window.innerHeight;
		const scale: number = Math.min(w / DESIGN_W, h / DESIGN_H);
		const offsetX: number = (w - DESIGN_W * scale) / 2;
		const offsetY: number = (h - DESIGN_H * scale) / 2;
		stageStyle = [
			`width:${DESIGN_W}px`,
			`height:${DESIGN_H}px`,
			`transform:scale(${scale})`,
			'transform-origin:top left',
			`left:${offsetX}px`,
			`top:${offsetY}px`,
			'position:fixed',
			'overflow:hidden',
			'background:#000',
		].join(';');
	}

	onMount((): (() => void) => {
		recalcScale();
		ready = true;
		const onResize = (): void => { recalcScale(); };
		window.addEventListener('resize', onResize);
		return (): void => { window.removeEventListener('resize', onResize); };
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if ready}
	<div style={stageStyle}>
		{@render children()}
	</div>
{/if}
