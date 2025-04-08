<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	Chart.register(...registerables);

	export let labels = [];
	export let values = [];
	export let labelX = 'Categoría';
	export let labelY = 'Valor';
	export let title = 'Gráfico de Barras';
	export let colors = ['rgba(59, 130, 246, 1)'];
	export let showGrid = true;
	export let showLegend = false;
	export let horizontal = false;

	let canvas;
	let chart = null;

	function renderChart() {
		if (chart) chart.destroy();
		if (!canvas) return;

		// Fix: En Chart.js v3 usamos 'indexAxis' en vez de 'horizontalBar'
		try {
			chart = new Chart(canvas, {
				type: 'bar',
				data: {
					labels,
					datasets: [{
						label: labelY,
						data: values,
						backgroundColor: colors.length === 1 ? colors[0] : colors,
						borderWidth: 1,
						borderRadius: 4
					}]
				},
				options: {
					indexAxis: horizontal ? 'y' : 'x',
					responsive: true,
					plugins: {
						title: {
							display: !!title,
							text: title,
							font: { size: 16 }
						},
						legend: { display: showLegend }
					},
					scales: {
						x: {
							title: { display: true, text: horizontal ? labelY : labelX },
							grid: { display: showGrid && !horizontal }
						},
						y: {
							title: { display: true, text: horizontal ? labelX : labelY },
							beginAtZero: true,
							grid: { display: showGrid }
						}
					}
				}
			});
		} catch (err) {
			console.error('Error al crear el gráfico:', err);
		}
	}

	// Garantizar que el DOM esté listo antes de renderizar
	onMount(() => setTimeout(renderChart, 50));

	// Actualizar si cambian los datos
	$: if (canvas && labels?.length && values?.length) {
		setTimeout(renderChart, 50);
	}

	onDestroy(() => {
		if (chart) chart.destroy();
	});
</script>

<div class="w-full bg-white p-4">
	<canvas bind:this={canvas}></canvas>
</div>
