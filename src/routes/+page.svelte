<script lang="ts">
	import FileUploader from '$lib/components/FileUploader.svelte';
	import CsvPreview from '$lib/components/CsvPreview.svelte';
	import { parseCsv, type CsvPreview as CsvPreviewType } from '$lib/utils/parseCsv';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import BarChartConfig from '$lib/components/charts/config/BarChartConfig.svelte';

	type ChartType = 'bar' | 'pie'; // futuros: 'line', 'doughnut', etc.

	let csvText = '';
	let previewData: CsvPreviewType | null = null;

	let selectedChartType: ChartType = 'bar';
	let showChart = false;

	let chartLabels: string[] = [];
	let chartValues: number[] = [];
	let xLabel = '';
	let yLabel = '';

	const handleCsvLoad = (text: string) => {
		csvText = text;
		previewData = parseCsv(text);
		showChart = false;
		chartLabels = [];
		chartValues = [];
		xLabel = '';
		yLabel = '';
	};

	// Si cambia el tipo de gráfico, ocultamos el gráfico anterior
	$: if (selectedChartType) {
		showChart = false;
	}
</script>

<div class="mx-auto mt-10 max-w-4xl space-y-6 rounded-2xl bg-white p-6 shadow-md">
	<h1 class="text-center text-2xl font-bold text-gray-800">Dashboard de CSV</h1>

	<FileUploader onLoad={handleCsvLoad} />

	{#if previewData}
		<CsvPreview {...previewData} />

		<!-- Tipo de gráfico -->
		<div class="mt-6">
			<label for="chartType" class="mb-1 block font-medium">Tipo de gráfico</label>
			<select
				id="chartType"
				bind:value={selectedChartType}
				on:change={() => {
					showChart = false;
					chartLabels = [];
					chartValues = [];
					xLabel = '';
					yLabel = '';
				}}
				class="w-full rounded-md border px-3 py-2"
			>
				<option value="bar">Gráfico de Barras</option>
				<option value="pie">Gráfico de Pastel</option>
			</select>
		</div>

		<!-- Configurador -->
		{#if selectedChartType === 'bar'}
			<BarChartConfig
				headers={previewData.headers}
				types={previewData.types}
				on:generate={(e) => {
					if (!previewData) return;

					const { xColumn, yColumn } = e.detail;

					xLabel = xColumn;
					yLabel = yColumn;

					chartLabels = previewData.rows.map((row) => String(row[xColumn] ?? ''));
					chartValues = previewData.rows.map((row, i) => {
						const raw = row[yColumn];
						const num = typeof raw === 'number' ? raw : parseFloat(String(raw));
						console.log(`Fila ${i + 1}: ${yColumn} =`, raw, '=>', num);
						return isNaN(num) ? 0 : num;
					});

					showChart = true;
				}}
			/>
		{:else}
			<p class="mt-4 text-sm text-gray-500">Este tipo de gráfico aún no está disponible.</p>
		{/if}

		<!-- Gráfico -->
		{#if showChart && selectedChartType === 'bar'}
			<div class="mt-8">
				<BarChart
					title={`Gráfico: ${yLabel} por ${xLabel}`}
					labelX={xLabel}
					labelY={yLabel}
					labels={chartLabels}
					values={chartValues}
				/>
			</div>
		{/if}
	{/if}
</div>
