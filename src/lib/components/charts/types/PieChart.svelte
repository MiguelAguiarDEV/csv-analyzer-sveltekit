<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	Chart.register(...registerables);

	export let labels = [];
	export let values = [];
	export let title = 'Gráfico de Pastel';
	export let colors = [
		'#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', 
		'#EC4899', '#8B5CF6', '#14B8A6', '#0EA5E9', '#F97316'
	];
	export let showLegend = true;
	export let doughnut = false;

	let canvas;
	let chart = null;

	// Asegurar suficientes colores
	function getColors(count) {
		if (colors.length >= count) return colors.slice(0, count);
		const result = [];
		for (let i = 0; i < count; i++) {
			result.push(colors[i % colors.length]);
		}
		return result;
	}

	function renderChart() {
		if (chart) chart.destroy();
		if (!canvas) return;

		try {
			chart = new Chart(canvas, {
				type: doughnut ? 'doughnut' : 'pie',
				data: {
					labels,
					datasets: [{
						data: values,
						backgroundColor: getColors(values.length),
						borderColor: 'white',
						borderWidth: 2,
						hoverOffset: 15
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
						},
						tooltip: {
							callbacks: {
								label: function(context) {
									const label = context.label || '';
									const value = context.raw || 0;
									const sum = context.dataset.data.reduce((a, b) => a + b, 0);
									const percentage = Math.round((value / sum) * 100);
									return `${label}: ${value} (${percentage}%)`;
								}
							}
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
