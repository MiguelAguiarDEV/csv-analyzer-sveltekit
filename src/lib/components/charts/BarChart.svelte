<script lang="ts">
	// Este archivo es un proxy que redirige al componente BarChart en la carpeta types
	// Lo mantenemos para compatibilidad con código existente
	import BarChartComponent from './types/BarChart.svelte';
	
	export let labels: string[] = [];
	export let values: number[] = [];
	export let labelX = 'Categoría';
	export let labelY = 'Valor';
	export let title = 'Gráfico de Barras';
	export let colors: string[] = ['rgba(59, 130, 246, 1)'];
	export let showGrid = true;
	export let showLegend = false;
	export let horizontal = false;
</script>

<BarChartComponent
	{labels}
	{values}
	{labelX}
	{labelY}
	{title}
	{colors}
	{showGrid}
	{showLegend}
	{horizontal}
/>
