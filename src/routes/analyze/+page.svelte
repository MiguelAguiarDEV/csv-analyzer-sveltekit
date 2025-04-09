<script lang="ts">
	import { parseCsv } from '$lib/services/csv/csvService';
	import FileUploader from '$lib/components/csv/FileUploader.svelte';
	import SimpleBarChart from '$lib/components/charts/SimpleBarChart.svelte';
	import ManualChartConfig from '$lib/components/charts/config/ManualChartConfig.svelte';
	import { processDataForBarChart } from '$lib/services/charts/chartConfigService';
	import * as Papa from 'papaparse';

	// Estado de la aplicación
	let csvText = '';
	let csvData: Record<string, any>[] = [];
	let headers: string[] = [];
	let showChart = false;
	let chartType: 'bar' | 'line' | 'pie' = 'bar';
	let chartConfig: any = null;
	let chartLabels: string[] = [];
	let chartData: number[] = [];
	let error: string | null = null;

	// Manejador de carga de archivo CSV
	function handleCsvLoad(text: string) {
		console.log('Archivo CSV cargado, longitud:', text.length);

		try {
			csvText = text;

			// Parsear CSV para obtener datos estructurados
			const parseResult = Papa.parse(text, {
				header: true,
				skipEmptyLines: true,
				dynamicTyping: true
			});

			if (parseResult.errors.length > 0) {
				console.warn('Errores al parsear CSV:', parseResult.errors);
			}

			headers = parseResult.meta.fields || [];
			csvData = parseResult.data;

			console.log('CSV parseado:', {
				filas: csvData.length,
				columnas: headers.length
			});

			// Reset chart
			showChart = false;
			chartLabels = [];
			chartData = [];
			error = null;
		} catch (err) {
			console.error('Error procesando CSV:', err);
			error = 'Error procesando el archivo CSV';
		}
	}

	// Manejador de generación de gráfico
	function handleGenerateChart(event: CustomEvent) {
		try {
			// Obtener configuración del evento
			chartConfig = event.detail;
			console.log('Generando gráfico con configuración:', chartConfig);

			// Procesar datos según configuración
			const processedData = {
				x_column: chartConfig.xColumn,
				y_column: chartConfig.yColumn,
				title: chartConfig.title,
				sort_by: chartConfig.sortBy,
				sort_ascending: chartConfig.sortAscending,
				limit: chartConfig.limit,
				groupBy: chartConfig.groupBy
			};

			const result = processDataForBarChart(csvData, processedData);

			chartLabels = result.labels;
			chartData = result.data;
			chartType = chartConfig.chartType;

			if (!chartLabels.length || !chartData.length) {
				throw new Error('No hay datos suficientes para visualizar');
			}

			showChart = true;
			console.log('Datos para gráfico:', { chartLabels, chartData });
		} catch (err) {
			console.error('Error generando gráfico:', err);
			error = err instanceof Error ? err.message : 'Error generando el gráfico';
			showChart = false;
		}
	}
</script>

<div
	class="bg-theme-primary border-theme-primary mx-auto my-8 max-w-6xl space-y-6 rounded-xl border p-6 shadow-md"
>
	<header class="border-theme-primary mb-4 border-b pb-4">
		<h1 class="text-theme-primary text-center text-2xl font-bold">📊 Análisis Manual de Datos</h1>
		<p class="text-theme-secondary mt-1 text-center">
			Configura y visualiza tus datos con opciones personalizadas
		</p>
	</header>

	<div class="bg-theme-secondary border-theme-primary mb-4 rounded-lg border p-5">
		<h2 class="text-theme-primary mb-3 text-lg font-semibold">Cargar Datos CSV</h2>
		<FileUploader onLoad={handleCsvLoad} />
	</div>

	{#if csvData.length > 0}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Panel izquierdo: Configuración -->
			<div>
				<ManualChartConfig {csvData} {headers} {chartType} on:generate={handleGenerateChart} />
			</div>

			<!-- Panel derecho: Visualización -->
			<div>
				{#if showChart && chartLabels.length && chartData.length}
					<div class="border-theme-primary overflow-hidden rounded-lg border shadow-sm">
						<div class="bg-theme-secondary border-theme-primary border-b p-4">
							<h2 class="text-theme-primary text-lg font-semibold">
								{chartConfig.title || 'Visualización de datos'}
							</h2>
						</div>

						<div class="bg-theme-primary p-4">
							{#if chartType === 'bar'}
								<SimpleBarChart
									labels={chartLabels}
									data={chartData}
									title=""
									xlabel={chartConfig.xColumn}
									ylabel={chartConfig.yColumn}
									color={chartConfig.colorScheme}
									horizontal={chartConfig.horizontal}
								/>
							{:else if chartType === 'line'}
								<!-- Futura implementación: gráfico de líneas -->
								<div class="bg-theme-secondary rounded-lg p-8 text-center">
									<p class="text-theme-secondary">Gráfico de líneas en desarrollo</p>
								</div>
							{:else if chartType === 'pie'}
								<!-- Futura implementación: gráfico circular -->
								<div class="bg-theme-secondary rounded-lg p-8 text-center">
									<p class="text-theme-secondary">Gráfico circular en desarrollo</p>
								</div>
							{/if}
						</div>
					</div>

					<!-- Detalles de configuración -->
					<div class="bg-theme-secondary border-theme-primary mt-4 rounded-lg border p-3">
						<details>
							<summary
								class="text-theme-primary hover:text-accent-primary cursor-pointer font-medium transition"
								>Detalles</summary
							>
							<div
								class="bg-theme-primary text-theme-secondary mt-2 overflow-auto rounded p-3 text-xs"
							>
								<p>Datos: {chartLabels.length} etiquetas, {chartData.length} valores</p>
								<p>Tipo: {chartType}, Horizontal: {chartConfig.horizontal ? 'Sí' : 'No'}</p>
								<p>Ordenado por: {chartConfig.sortBy}, {chartConfig.sortAscending ? '↑' : '↓'}</p>
								<p>Limitado a: {chartConfig.limit || 'Sin límite'}</p>
							</div>
						</details>
					</div>
				{:else if error}
					<div class="alert alert-error rounded-lg p-4">
						<h3 class="mb-1 font-medium">Error</h3>
						<p>{error}</p>
					</div>
				{:else}
					<div
						class="bg-theme-secondary border-theme-primary flex h-96 items-center justify-center rounded-lg border"
					>
						<div class="px-6 py-8 text-center">
							<p class="text-theme-secondary mb-3">
								Configura los parámetros y genera un gráfico para visualizar tus datos
							</p>

							{#if csvData.length > 0}
								<p class="text-theme-secondary text-sm">
									{csvData.length} filas y {headers.length} columnas disponibles para análisis
								</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Vista previa de datos -->
		<div class="mt-6">
			<h3 class="text-theme-primary mb-3 text-lg font-semibold">Vista previa de datos</h3>
			<div class="border-theme-primary overflow-x-auto rounded-lg border">
				<table class="divide-theme-secondary min-w-full divide-y">
					<thead class="bg-theme-secondary">
						<tr>
							{#each headers.slice(0, 5) as header}
								<th
									class="text-theme-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
								>
									{header}
								</th>
							{/each}
							{#if headers.length > 5}
								<th class="text-theme-secondary px-6 py-3 text-left text-xs font-medium"> ... </th>
							{/if}
						</tr>
					</thead>
					<tbody class="bg-theme-primary divide-theme-secondary divide-y">
						{#each csvData.slice(0, 5) as row}
							<tr class="hover:bg-theme-secondary transition-colors duration-150">
								{#each headers.slice(0, 5) as header}
									<td class="text-theme-primary px-6 py-4 text-sm whitespace-nowrap">
										{row[header] ?? '-'}
									</td>
								{/each}
								{#if headers.length > 5}
									<td class="text-theme-secondary px-6 py-4 text-sm whitespace-nowrap"> ... </td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if csvData.length > 5}
				<p class="text-theme-secondary mt-2 text-xs">
					Mostrando 5 de {csvData.length} filas
				</p>
			{/if}
		</div>
	{:else if csvText}
		<div class="alert alert-info p-8 text-center">
			<p class="text-theme-secondary">El archivo CSV no contiene datos para analizar</p>
		</div>
	{/if}
</div>
