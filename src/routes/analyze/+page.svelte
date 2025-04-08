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

<div class="mx-auto my-8 max-w-6xl space-y-6 rounded-xl bg-white p-6 shadow-md">
	<header class="border-b pb-4 mb-4">
		<h1 class="text-center text-2xl font-bold">📊 Análisis Manual de Datos</h1>
		<p class="text-center text-gray-600 mt-1">
			Configura y visualiza tus datos con opciones personalizadas
		</p>
	</header>

	<div class="mb-4">
		<a href="/" class="text-blue-600 hover:underline flex items-center">
			<span class="mr-1">←</span> Volver al Dashboard
		</a>
	</div>

	<div class="p-5 bg-gray-50 rounded-lg mb-4 border border-gray-200">
		<h2 class="text-lg font-semibold mb-3">Cargar Datos CSV</h2>
		<FileUploader onLoad={handleCsvLoad} />
	</div>

	{#if csvData.length > 0}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Panel izquierdo: Configuración -->
			<div>
				<ManualChartConfig 
					{csvData} 
					{headers} 
					{chartType}
					on:generate={handleGenerateChart}
				/>
			</div>
			
			<!-- Panel derecho: Visualización -->
			<div>
				{#if showChart && chartLabels.length && chartData.length}
					<div class="rounded-lg overflow-hidden border shadow-sm">
						<div class="bg-gray-50 border-b p-4">
							<h2 class="text-lg font-semibold">{chartConfig.title || 'Visualización de datos'}</h2>
						</div>
						
						<div class="bg-white p-4">
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
								<div class="p-8 text-center bg-yellow-50 rounded-lg">
									<p class="text-yellow-700">Gráfico de líneas en desarrollo</p>
								</div>
							{:else if chartType === 'pie'}
								<!-- Futura implementación: gráfico circular -->
								<div class="p-8 text-center bg-yellow-50 rounded-lg">
									<p class="text-yellow-700">Gráfico circular en desarrollo</p>
								</div>
							{/if}
						</div>
					</div>
					
					<!-- Detalles de configuración -->
					<div class="mt-4 p-3 bg-gray-50 border rounded-lg">
						<details>
							<summary class="cursor-pointer font-medium">Detalles</summary>
							<div class="mt-2 p-3 bg-gray-100 rounded overflow-auto text-xs">
								<p>Datos: {chartLabels.length} etiquetas, {chartData.length} valores</p>
								<p>Tipo: {chartType}, Horizontal: {chartConfig.horizontal ? 'Sí' : 'No'}</p>
								<p>Ordenado por: {chartConfig.sortBy}, {chartConfig.sortAscending ? '↑' : '↓'}</p>
								<p>Limitado a: {chartConfig.limit || 'Sin límite'}</p>
							</div>
						</details>
					</div>
				{:else if error}
					<div class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
						<h3 class="font-medium mb-1">Error</h3>
						<p>{error}</p>
					</div>
				{:else}
					<div class="flex justify-center items-center h-96 bg-gray-50 rounded-lg border border-gray-200">
						<div class="text-center px-6 py-8">
							<p class="text-gray-500 mb-3">Configura los parámetros y genera un gráfico para visualizar tus datos</p>
							
							{#if csvData.length > 0}
								<p class="text-sm text-gray-400">
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
			<h3 class="font-semibold text-lg mb-3">Vista previa de datos</h3>
			<div class="overflow-x-auto rounded-lg border border-gray-200">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							{#each headers.slice(0, 5) as header}
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									{header}
								</th>
							{/each}
							{#if headers.length > 5}
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-400">
									...
								</th>
							{/if}
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each csvData.slice(0, 5) as row}
							<tr>
								{#each headers.slice(0, 5) as header}
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
										{row[header] ?? '-'}
									</td>
								{/each}
								{#if headers.length > 5}
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
										...
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if csvData.length > 5}
				<p class="text-xs text-gray-500 mt-2">
					Mostrando 5 de {csvData.length} filas
				</p>
			{/if}
		</div>
	{:else if csvText}
		<div class="p-8 text-center">
			<p class="text-gray-500">El archivo CSV no contiene datos para analizar</p>
		</div>
	{/if}
</div>
