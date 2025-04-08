<script lang="ts">
	import { onMount } from 'svelte';
	import FileUploader from '$lib/components/csv/FileUploader.svelte';
	import SimpleBarChart from '$lib/components/charts/SimpleBarChart.svelte';
	import LoadingButton from '$lib/components/ui/LoadingButton.svelte';
	import ResultOutput from '$lib/components/results/ResultOutput.svelte';
	import {
		getBarChartConfigFromAI,
		processDataForBarChart
	} from '$lib/services/charts/chartConfigService';
	import type { BarChartConfig } from '$lib/services/charts/chartConfigService';
	import { generateInsightsPrompt, generateConclusionPrompt } from '$lib/prompts/prompts';
	import * as Papa from 'papaparse';

	// Estado de la aplicación
	let csvText = '';
	let csvData = [];
	let isLoading = false;
	let error = null;
	let chartConfig = null;
	let chartLabels = [];
	let chartData = [];
	let insights = '';
	let conclusion = '';

	// Inicialización
	onMount(() => {
		console.log('Página de análisis automático montada');
	});

	// Manejador de carga de archivo CSV
	async function handleCsvLoad(text) {
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

			console.log('CSV parseado:', {
				filas: parseResult.data.length,
				columnas: parseResult.meta.fields?.length || 0
			});

			if (!parseResult.data.length) {
				throw new Error('El archivo CSV no contiene datos');
			}

			csvData = parseResult.data;
			error = null;

			// Generar visualización automáticamente
			await generateVisualization();
		} catch (err) {
			console.error('Error procesando CSV:', err);
			error = err.message || 'Error procesando el archivo CSV';
		}
	}

	// Genera la visualización
	async function generateVisualization() {
		if (!csvText || !csvData.length) {
			console.warn('No hay datos para visualizar');
			return;
		}

		isLoading = true;
		error = null;
		chartLabels = [];
		chartData = [];
		insights = '';
		conclusion = '';

		try {
			console.log('Generando visualización...');

			// 1. Obtener configuración de la IA
			chartConfig = await getBarChartConfigFromAI(csvText);
			console.log('Configuración obtenida:', chartConfig);

			// 2. Procesar datos según la configuración
			const { labels, data } = processDataForBarChart(csvData, chartConfig);
			chartLabels = labels;
			chartData = data;

			if (!chartLabels.length || !chartData.length) {
				throw new Error('No se pudieron generar datos para la visualización');
			}

			console.log('Datos para gráfico listos:', { chartLabels, chartData });

			// 3. Solicitar insights y conclusiones
			await getInsightsAndConclusions();
		} catch (err) {
			console.error('Error generando visualización:', err);
			error = err.message || 'Error generando la visualización';
		} finally {
			isLoading = false;
		}
	}

	// Obtiene insights y conclusiones de la IA
	async function getInsightsAndConclusions() {
		if (!chartConfig) return;

		try {
			console.log('Solicitando insights y conclusiones...');

			// Construir prompts para la IA
			const insightsPrompt = generateInsightsPrompt(csvText, {
				type: 'bar',
				title: chartConfig.title,
				xColumn: chartConfig.x_column,
				yColumn: chartConfig.y_column
			});

			const conclusionPrompt = generateConclusionPrompt(
				csvText,
				chartConfig.x_column,
				chartConfig.y_column
			);

			// Solicitar en paralelo
			const [insightsRes, conclusionRes] = await Promise.all([
				fetch('/api/geminai', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ prompt: insightsPrompt })
				}),
				fetch('/api/geminai', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ prompt: conclusionPrompt })
				})
			]);

			const insightsData = await insightsRes.json();
			const conclusionData = await conclusionRes.json();

			insights = insightsData.content?.trim() || '';
			conclusion = conclusionData.content?.trim() || '';

			console.log('Insights y conclusiones recibidas');
		} catch (err) {
			console.error('Error obteniendo insights o conclusiones:', err);
			// No lanzamos error para que no bloquee la visualización
		}
	}
</script>

<div class="mx-auto my-8 space-y-6 rounded-xl bg-white p-6 shadow-md">
	<header class="mb-4 border-b pb-4">
		<h1 class="text-center text-2xl font-bold">🧠 Análisis de Datos con IA</h1>
		<p class="mt-1 text-center text-gray-600">
			La IA generará automáticamente la mejor visualización para tus datos
		</p>
	</header>

	<div class="mb-4">
		<a href="/" class="flex items-center text-blue-600 hover:underline">
			<span class="mr-1">←</span> Volver al Dashboard
		</a>
	</div>

	<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-5">
		<h2 class="mb-3 text-lg font-semibold">Cargar Datos CSV</h2>
		<p class="mb-4 text-gray-600">
			La IA analizará los datos y generará la visualización más adecuada automáticamente
		</p>
		<FileUploader onLoad={handleCsvLoad} />
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center rounded-lg bg-blue-50 p-6">
			<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700"></div>
			<p class="ml-3 text-blue-700">Procesando datos...</p>
		</div>
	{/if}

	{#if error}
		<ResultOutput {error} />
	{/if}

	{#if chartConfig && chartLabels.length && chartData.length}
		<div class="overflow-hidden rounded-lg border shadow-sm">
			<div class="border-b bg-gray-50 p-4">
				<h2 class="text-lg font-semibold">{chartConfig.title}</h2>
			</div>

			<!-- Gráfico -->
			<div class="bg-white p-4">
				<SimpleBarChart
					labels={chartLabels}
					data={chartData}
					title=""
					xlabel={chartConfig.xlabel}
					ylabel={chartConfig.ylabel}
					color={chartConfig.color}
					horizontal={chartConfig.horizontal}
					figsize={chartConfig.figsize}
				/>
			</div>
		</div>

		<!-- Configuración -->
		<div class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
			<h3 class="mb-2 font-semibold">Configuración del Gráfico</h3>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div>
					<span class="font-medium">Columna X:</span>
					{chartConfig.x_column}
				</div>
				<div>
					<span class="font-medium">Columna Y:</span>
					{chartConfig.y_column}
				</div>
				<div>
					<span class="font-medium">Ordenado por:</span>
					{chartConfig.sort_by === 'none'
						? 'Sin ordenar'
						: chartConfig.sort_by === 'value'
							? 'Valor'
							: 'Etiqueta'}
					{chartConfig.sort_by !== 'none'
						? chartConfig.sort_ascending
							? '(ascendente)'
							: '(descendente)'
						: ''}
				</div>
				<div>
					<span class="font-medium">Limitado a:</span>
					{chartConfig.limit ? `${chartConfig.limit} elementos` : 'Sin límite'}
				</div>
			</div>
		</div>

		<!-- Insights -->
		{#if insights}
			<div class="mt-6 rounded-lg border-l-4 border-indigo-400 bg-indigo-50 p-4">
				<h2 class="mb-3 text-lg font-semibold text-indigo-900">Insights</h2>
				<div class="prose prose-sm max-w-none">
					{@html insights.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')}
				</div>
			</div>
		{/if}

		<!-- Conclusión -->
		{#if conclusion}
			<div class="mt-4 rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
				<h2 class="mb-2 font-semibold text-blue-900">Conclusión</h2>
				<p>{conclusion}</p>
			</div>
		{/if}

		<!-- Botón regenerar -->
		<div class="mt-6 flex justify-center">
			<LoadingButton
				onClick={generateVisualization}
				loading={isLoading}
				label="Regenerar Análisis"
			/>
		</div>

		<!-- Debug -->
		<div class="mt-4 rounded-lg border bg-gray-50 p-3">
			<details>
				<summary class="cursor-pointer font-medium">Debug Info</summary>
				<div class="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
					<p>Labels: {chartLabels.length} | Data: {chartData.length}</p>
					<p>First Label: {chartLabels[0]} | First Value: {chartData[0]}</p>
					<pre>{JSON.stringify(chartConfig, null, 2)}</pre>
				</div>
			</details>
		</div>
	{/if}
</div>
