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
	let chartLabels: string | any[] = [];
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
		} catch (err: unknown) {
			console.error('Error procesando CSV:', err);
			error = err instanceof Error ? err.message : 'Error procesando el archivo CSV';
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
			// No se lanza error para no bloquear la visualización
		}
	}
</script>

/** eslint-disable svelte/no-at-html-tags */
<div
	class="bg-theme-primary border-theme-primary mx-auto my-8 space-y-6 rounded-xl border p-6 shadow-md"
>
	<header class="border-theme-primary mb-4 border-b pb-4">
		<h1 class="text-theme-primary text-center text-2xl font-bold">🧠 Análisis de Datos con IA</h1>
		<p class="accent-theme-primary mt-1 text-center">
			La IA generará automáticamente la mejor visualización para tus datos
		</p>
	</header>

	<div class="bg-theme-secondary border-theme-primary mb-4 rounded-lg border p-5">
		<h2 class="text-theme-primary mb-3 text-lg font-semibold">Cargar Datos CSV</h2>
		<p class="text-theme-secondary mb-4">
			La IA analizará los datos y generará la visualización más adecuada automáticamente
		</p>
		<FileUploader onLoad={handleCsvLoad} />
	</div>

	{#if isLoading}
		<div class="bg-theme-secondary flex items-center justify-center rounded-lg p-6">
			<div class="border-accent-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
			<p class="text-theme-primary ml-3">Procesando datos...</p>
		</div>
	{/if}

	{#if error}
		<ResultOutput {error} />
	{/if}

	{#if chartConfig && chartLabels.length && chartData.length}
		<div class="border-theme-primary overflow-hidden rounded-lg border shadow-sm">
			<div class="bg-theme-secondary border-theme-primary border-b p-4">
				<h2 class="text-theme-primary text-lg font-semibold">{chartConfig.title}</h2>
			</div>

			<!-- Gráfico -->
			<div class="bg-theme-primary p-4">
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
		<div class="bg-theme-secondary border-theme-secondary mt-4 rounded-lg border p-4">
			<h3 class="text-theme-primary mb-2 font-semibold">Configuración del Gráfico</h3>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div>
					<span class="text-theme-primary font-medium">Columna X:</span>
					<span class="text-theme-secondary">{chartConfig.x_column}</span>
				</div>
				<div>
					<span class="text-theme-primary font-medium">Columna Y:</span>
					<span class="text-theme-secondary">{chartConfig.y_column}</span>
				</div>
				<div>
					<span class="text-theme-primary font-medium">Ordenado por:</span>
					<span class="text-theme-secondary">
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
					</span>
				</div>
				<div>
					<span class="text-theme-primary font-medium">Limitado a:</span>
					<span class="text-theme-secondary"
						>{chartConfig.limit ? `${chartConfig.limit} elementos` : 'Sin límite'}</span
					>
				</div>
			</div>
		</div>

		<!-- Insights -->
		{#if insights}
			<div class="bg-theme-secondary border-accent-primary mt-6 rounded-lg border-l-4 p-4">
				<h2 class="accent-theme-primary mb-3 text-lg font-semibold">Insights</h2>
				<div class="prose prose-sm text-theme-secondary max-w-none">
					{@html insights.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')}
				</div>
			</div>
		{/if}

		<!-- Conclusión -->
		{#if conclusion}
			<div class="bg-theme-secondary border-accent-secondary mt-4 rounded-lg border-l-4 p-4">
				<h2 class="accent-theme-primary mb-2 font-semibold">Conclusión</h2>
				<p class="text-theme-primary">{conclusion}</p>
			</div>
		{/if}

		<!-- Botón regenerar -->
		<div class="mt-6 flex justify-center">
			<LoadingButton
				onClick={generateVisualization}
				loading={isLoading}
				label="Regenerar Análisis"
				class="bg-accent-primary hover:bg-accent-secondary transform rounded-lg px-4 py-2 text-white transition hover:-translate-y-1"
			/>
		</div>

		<!-- Debug -->
		<div class="bg-theme-secondary border-theme-secondary mt-4 rounded-lg border p-3">
			<details>
				<summary
					class="text-theme-primary hover:text-accent-primary cursor-pointer font-medium transition"
					>Debug Info</summary
				>
				<div class="bg-theme-primary text-theme-secondary mt-2 overflow-auto rounded p-3 text-xs">
					<p>Labels: {chartLabels.length} | Data: {chartData.length}</p>
					<p>First Label: {chartLabels[0]} | First Value: {chartData[0]}</p>
					<pre>{JSON.stringify(chartConfig, null, 2)}</pre>
				</div>
			</details>
		</div>
	{/if}
</div>
