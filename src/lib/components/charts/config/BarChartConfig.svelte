<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let headers: string[] = [];
	export let types: Record<string, string> = {};

	let xColumn = '';
	let yColumn = '';

	const dispatch = createEventDispatcher();

	// Solo columnas numéricas para Y
	$: numericHeaders = headers.filter((key) => types[key] === 'number');

	function generar() {
		if (!xColumn || !yColumn) return;

		dispatch('generate', { xColumn, yColumn });
	}
</script>

<div class="mt-6 grid gap-4 md:grid-cols-2">
	<div>
		<label for="xColumn" class="mb-1 block font-medium">Eje X (categoría)</label>
		<select id="xColumn" bind:value={xColumn} class="w-full rounded-md border px-3 py-2">
			<option value="">Selecciona una columna</option>
			{#each headers as header (header)}
				<option value={header}>{header}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="yColumn" class="mb-1 block font-medium">Eje Y (valor numérico)</label>
		<select id="yColumn" bind:value={yColumn} class="w-full rounded-md border px-3 py-2">
			<option value="">Selecciona una columna</option>
			{#each numericHeaders as header (header)}
				<option value={header}>{header}</option>
			{/each}
		</select>
	</div>

	<div class="md:col-span-2">
		<button
			on:click={generar}
			disabled={!xColumn || !yColumn}
			class="mt-4 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
		>
			Generar gráfico
		</button>
	</div>
</div>
