<script>
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	
	// Propiedades del componente
	export let title = "Gráfico de Barras";
	export let xAxisLabel = "Categorías";
	export let yAxisLabel = "Valores";
	export let xAxisData = [];
	export let yAxisData = [];
	export let barColor = "#4F46E5";
	
	// Referencias y variables internas
	let canvasElement;
	let chartInstance = null;
	let chartId = `chart-${Math.random().toString(36).slice(2, 10)}`;
	
	// Para depuración
	$: console.log(`[BasicBarChart] Datos recibidos - X: ${xAxisData.length}, Y: ${yAxisData.length}`);
	$: if (xAxisData.length > 0) console.log(`[BasicBarChart] Primeros datos X:`, xAxisData.slice(0, 3));
	$: if (yAxisData.length > 0) console.log(`[BasicBarChart] Primeros datos Y:`, yAxisData.slice(0, 3));
	
	// Función para crear/actualizar el gráfico
	function renderChart() {
		console.log(`[BasicBarChart] Iniciando renderización del gráfico (ID: ${chartId})`);
		
		// Destruir instancia anterior si existe
		if (chartInstance) {
			console.log("[BasicBarChart] Destruyendo instancia anterior del gráfico");
			chartInstance.destroy();
			chartInstance = null;
		}
		
		// Validar que tengamos datos
		if (!xAxisData.length || !yAxisData.length || !canvasElement) {
			console.warn("[BasicBarChart] No hay datos suficientes o canvas no disponible");
			return;
		}
		
		try {
			// Crear contexto y configuración
			const ctx = canvasElement.getContext('2d');
			
			const config = {
				type: 'bar',
				data: {
					labels: xAxisData,
					datasets: [{
						label: yAxisLabel,
						data: yAxisData,
						backgroundColor: barColor,
						borderColor: barColor,
						borderWidth: 1
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
							display: true,
							position: 'top'
						},
						tooltip: {
							enabled: true
						}
					},
					scales: {
						x: {
							title: {
								display: true,
								text: xAxisLabel
							}
						},
						y: {
							title: {
								display: true,
								text: yAxisLabel
							},
							beginAtZero: true
						}
					}
				}
			};
			
			console.log("[BasicBarChart] Creando nueva instancia con configuración:", config);
			
			// Crear nueva instancia
			chartInstance = new Chart(ctx, config);
			console.log("[BasicBarChart] Gráfico renderizado correctamente");
		} catch (error) {
			console.error("[BasicBarChart] Error al renderizar el gráfico:", error);
		}
	}
	
	// Renderizar cuando cambian los datos
	$: if (canvasElement && xAxisData.length > 0 && yAxisData.length > 0) {
		console.log("[BasicBarChart] Datos actualizados, programando re-renderizado");
		// Usar setTimeout para garantizar que el DOM esté listo
		setTimeout(renderChart, 50);
	}
	
	// Ciclo de vida del componente
	onMount(() => {
		console.log("[BasicBarChart] Componente montado");
		if (xAxisData.length > 0 && yAxisData.length > 0) {
			setTimeout(renderChart, 50);
		}
	});
	
	onDestroy(() => {
		console.log("[BasicBarChart] Componente desmontado, limpiando");
		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}
	});
</script>

<div class="chart-container p-3 bg-white rounded-lg shadow-sm">
	{#if xAxisData.length === 0 || yAxisData.length === 0}
		<div class="flex items-center justify-center h-64 bg-gray-50 rounded-md border border-gray-200">
			<p class="text-gray-500">No hay datos suficientes para visualizar</p>
		</div>
	{:else}
		<canvas id={chartId} bind:this={canvasElement}></canvas>
	{/if}
</div>
