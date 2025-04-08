<script lang="ts">
	import FileUploader from '$lib/components/FileUploader.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import { parseCsv, type CsvPreview } from '$lib/utils/parseCsv';
	import { generateChartPrompt, generateConclusionPrompt } from '$lib/prompts/prompts';

	let csvText = '';
	let csvData: CsvPreview | null = null;

	let isLoading = false;
	let error: string | null = null;

	let chartLabels: string[] = [];
	let chartValues: number[] = [];
	let xLabel = '';
	let yLabel = '';
	let showChart = false;

	let conclusion = '';

	// Limpia el bloque ```json del resultado
	function extractJson(text: string): string {
		return text
			.trim()
			.replace(/```(?:json)?\n?/gi, '') // remueve ```json o ```
			.replace(/```$/, '');
	}

	async function handleCsvLoad(text: string) {
		csvText = text;
		csvData = parseCsv(text);
		error = null;
		showChart = false;

		await generarGraficoConIA();
	}

	async function generarGraficoConIA() {
		if (!csvText || !csvData) return;

		isLoading = true;
		error = null;
		conclusion = '';
		showChart = false;

		const prompt = generateChartPrompt(csvText);

		try {
			// 1. Pedir especificación del gráfico
			const res = await fetch('/api/geminai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt })
			});

			const result = await res.json();

			// Limpieza del bloque ```json
			const clean = result.content
				.trim()
				.replace(/```(?:json)?\n?/gi, '')
				.replace(/```$/, '');
			const parsed = JSON.parse(clean);

			const { xColumn, yColumn } = parsed;

			// 2. Preparar datos para la gráfica
			xLabel = xColumn;
			yLabel = yColumn;

			chartLabels = csvData.rows.map((row) => String(row[xColumn] ?? ''));
			chartValues = csvData.rows.map((row) => {
				const val = row[yColumn];
				const num = typeof val === 'number' ? val : parseFloat(String(val));
				return isNaN(num) ? 0 : num;
			});

			showChart = true;

			// 3. Pedir conclusión de la IA
			const conclusionPrompt = generateConclusionPrompt(csvText, xColumn, yColumn);
			const res2 = await fetch('/api/geminai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: conclusionPrompt })
			});
			const res2json = await res2.json();
			conclusion = res2json.content?.trim() ?? '';
		} catch (err) {
			console.error(err);
			error = 'Error al procesar la respuesta de la IA. Asegúrate de que devuelva JSON válido.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="mx-auto mt-10 max-w-3xl space-y-6 rounded-2xl bg-white p-6 shadow">
	<h1 class="text-center text-2xl font-bold text-gray-800">🧠 Gráfica generada por IA</h1>

	<FileUploader onLoad={handleCsvLoad} />

	{#if isLoading}
		<p class="mt-4 text-sm text-blue-600">Analizando CSV con IA...</p>
	{/if}

	{#if error}
		<p class="mt-4 text-sm text-red-600">{error}</p>
	{/if}

	{#if showChart}
		<BarChart
			title={`Gráfico generado por IA: ${yLabel} por ${xLabel}`}
			labelX={xLabel}
			labelY={yLabel}
			labels={chartLabels}
			values={chartValues}
		/>
		{#if conclusion}
			<div class="mt-4 rounded border-l-4 border-blue-400 bg-gray-50 p-4 text-sm text-gray-800">
				<h2 class="mb-1 font-semibold">Conclusión de la IA:</h2>
				<p>{conclusion}</p>
			</div>
		{/if}
	{/if}
</div>
