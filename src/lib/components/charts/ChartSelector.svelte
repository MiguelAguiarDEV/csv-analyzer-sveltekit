<script lang="ts">
	import BarChart from './types/BarChart.svelte';
	import LineChart from './types/LineChart.svelte';
	import PieChart from './types/PieChart.svelte';

	export let chartType = 'bar';
	export let labels = [];
	export let values = [];
	export let title = '';
	export let labelX = '';
	export let labelY = '';
	export let config = null;
	
	// Propiedades básicas
	$: colors = config?.configuration?.style?.colors || ['#4F46E5'];
	$: showGrid = config?.configuration?.style?.showGridLines !== false;
	$: showLegend = config?.configuration?.style?.showLegend || false;
	$: horizontal = chartType === 'bar' && labels.length > 8;

	// Clave única para forzar recreación
	let key = 0;
	$: if (labels.length && values.length) key++;
</script>

{#key key}
	<div class="chart-container h-[400px]">
		{#if chartType === 'bar'}
			<BarChart {labels} {values} {labelX} {labelY} {title} 
				colors={colors} {showGrid} {showLegend} {horizontal} />
				
		{:else if chartType === 'line'}
			<LineChart {labels} {values} {labelX} {labelY} {title}
				color={colors[0]} {showGrid} {showLegend} />
				
		{:else if chartType === 'pie' || chartType === 'doughnut'}
			<PieChart {labels} {values} {title} colors={colors} 
				{showLegend} doughnut={chartType === 'doughnut'} />
				
		{:else}
			<div class="p-4 text-center bg-gray-100 rounded">
				<p class="text-gray-600">Tipo de gráfico no soportado: {chartType}</p>
			</div>
		{/if}
	</div>
{/key}
