<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	Chart.register(...registerables);

	export let labels = [];
	export let values = [];
	export let labelX = 'Eje X';
	export let labelY = 'Eje Y';
	export let title = 'Gráfico de Línea';
	export let color = 'rgba(75, 192, 192, 1)';
	export let showGrid = true;
	export let showLegend = false;
	export let tension = 0.4;
	export let fill = false;

	let canvas;
	let chart = null;

	function renderChart() {
		if (chart) chart.destroy();
		if (!canvas) return;

		try {
			chart = new Chart(canvas, {
				type: 'line',
				data: {
					labels,
					datasets: [{
						label: labelY,
						data: values,
						borderColor: color,
						backgroundColor: fill ? color.replace('1)', '0.2)') : 'transparent',
						borderWidth: 2,
						pointRadius: 4,
						tension,
						fill
					}]
				},
				options: {
					responsive: true,
					plugins: {
						title: {
							display: !!title,
							text: title,
							font: { size: 16 }
						},
						legend: { 
							display: showLegend,
							position: 'top'
						}
					},
					scales: {
						x: {
							title: { display: true, text: labelX },
							grid: { display: showGrid }
						},
						y: {
							title: { display: true, text: labelY },
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

	onMount(() => setTimeout(renderChart, 50));

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
