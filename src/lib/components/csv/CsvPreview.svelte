<script lang="ts">
	export let headers: string[] = [];
	export let rows: Record<string, unknown>[] = [];
	export let types: Record<string, string> = {};
</script>

<div class="border-theme-primary mt-6 overflow-x-auto rounded-xl border shadow-sm">
	<table class="text-theme-primary min-w-full text-left text-sm">
		<thead
			class="bg-theme-secondary text-theme-primary text-xs font-semibold tracking-wide uppercase"
		>
			<tr>
				{#each headers as header (header)}
					<th class="border-theme-primary border-b px-4 py-2">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			<!-- Filas de datos -->
			{#each rows as row, i (i)}
				<tr class="even:bg-theme-secondary/50 hover:bg-theme-secondary">
					{#each headers as header (header)}
						<td class="border-theme-secondary border-b px-4 py-2 whitespace-nowrap">
							{row[header] ?? '—'}
						</td>
					{/each}
				</tr>
			{/each}

			<!-- Fila de tipos -->
			<tr
				class="border-accent-primary bg-accent-secondary text-accent-primary border-t text-xs font-medium"
			>
				{#each headers as header (header)}
					<td class="px-4 py-2 text-[11px] italic">Tipo: {types[header]}</td>
				{/each}
			</tr>
		</tbody>
	</table>
</div>
