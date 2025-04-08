<script lang="ts">
	export let headers: string[] = [];
	export let rows: Record<string, unknown>[] = [];
	export let types: Record<string, string> = {};
</script>

<div class="mt-6 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
	<table class="min-w-full bg-white text-left text-sm text-gray-700">
		<thead class="bg-gray-100 text-xs font-semibold tracking-wide text-gray-900 uppercase">
			<tr>
				{#each headers as header (header)}
					<th class="border-b border-gray-300 px-4 py-2">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			<!-- Filas de datos -->
			{#each rows as row, i (i)}
				<tr class="even:bg-gray-50/50 hover:bg-gray-50">
					{#each headers as header (header)}
						<td class="border-b border-gray-100 px-4 py-2 whitespace-nowrap">
							{row[header] ?? '—'}
						</td>
					{/each}
				</tr>
			{/each}

			<!-- Fila de tipos -->
			<tr class="border-t border-blue-200 bg-blue-50 text-xs font-medium text-blue-800">
				{#each headers as header (header)}
					<td class="px-4 py-2 text-[11px] italic">Tipo: {types[header]}</td>
				{/each}
			</tr>
		</tbody>
	</table>
</div>
