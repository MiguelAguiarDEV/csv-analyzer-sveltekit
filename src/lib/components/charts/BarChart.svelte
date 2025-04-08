<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, type ChartConfiguration, registerables } from 'chart.js';

	Chart.register(...registerables);

	export let labels: string[] = [];
	export let values: number[] = [];
	export let labelX = 'Categoría';
	export let labelY = 'Valor';
	export let title = 'Gráfico de Barras';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	function renderChart() {
		if (chart) chart.destroy();

		const config: ChartConfiguration<'bar'> = {
			type: 'bar',
			data: {
				labels: [...labels],
				datasets: [
					{
						label: labelY,
						data: [...values],
						backgroundColor: 'rgba(59, 130, 246, 1)',
						borderRadius: 6
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: title,
						font: { size: 16 }
					},
					legend: { display: false }
				},
				scales: {
					x: {
						title: { display: true, text: labelX }
					},
					y: {
						title: { display: true, text: labelY },
						beginAtZero: true
					}
				}
			}
		};

		chart = new Chart(canvas, config);
	}

	// Inicial
	onMount(() => {
		renderChart();
	});

	// Reactivo: vuelve a dibujar el gráfico si cambian props
	$: if (labels.length && values.length) {
		renderChart();
	}

	onDestroy(() => {
		chart?.destroy();
	});
</script>

<div class="w-full rounded-xl border bg-white p-4 shadow-sm">
	<canvas bind:this={canvas}></canvas>
</div>
