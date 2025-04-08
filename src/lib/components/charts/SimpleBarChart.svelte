<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart } from 'chart.js/auto';
  
  // Propiedades principales (estilo pandas)
  export let data: number[] = []; // Datos numéricos para el eje Y
  export let labels: string[] = []; // Etiquetas para el eje X
  export let title: string = 'Gráfico de Barras';
  export let xlabel: string = '';
  export let ylabel: string = '';
  export let figsize: [number, number] = [800, 400]; // [ancho, alto] en px
  export let color: string = '#4F46E5';
  export let horizontal: boolean = false;
  
  // Elemento canvas
  let canvas: HTMLCanvasElement;
  let chartInstance: Chart | null = null;
  
  // ID único para evitar conflictos
  const chartId = `chart-${Math.random().toString(36).slice(2, 9)}`;
  
  console.log(`SimpleBarChart: Inicializando gráfico ${chartId}`);
  
  function createChart() {
    if (!canvas) {
      console.error('SimpleBarChart: No hay elemento canvas disponible');
      return;
    }
    
    if (!data || !data.length || !labels || !labels.length) {
      console.error('SimpleBarChart: No hay datos para mostrar', { data, labels });
      return;
    }
    
    console.log('SimpleBarChart: Creando gráfico con datos:', { data, labels });
    
    // Destruir gráfico anterior si existe
    if (chartInstance) {
      console.log('SimpleBarChart: Destruyendo gráfico anterior');
      chartInstance.destroy();
      chartInstance = null;
    }
    
    // Configuración básica
    const config = {
      type: 'bar',
      data: {
        labels: labels.map(l => String(l || 'Sin etiqueta')),
        datasets: [{
          label: ylabel,
          data: data.map(d => Number(d) || 0),
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: !!ylabel,
            position: 'top'
          },
          tooltip: {
            intersect: false
          }
        },
        scales: {
          x: {
            title: {
              display: !!xlabel,
              text: xlabel,
              font: { weight: 'bold' }
            },
            ticks: {
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            title: {
              display: !!ylabel,
              text: ylabel,
              font: { weight: 'bold' }
            },
            beginAtZero: true
          }
        }
      }
    };
    
    try {
      // Crear gráfico
      console.log('SimpleBarChart: Aplicando configuración', config);
      chartInstance = new Chart(canvas, config);
      console.log('SimpleBarChart: Gráfico creado exitosamente');
    } catch (err) {
      console.error('SimpleBarChart: Error creando gráfico:', err);
    }
  }
  
  onMount(() => {
    console.log('SimpleBarChart: Componente montado');
    // Breve espera para asegurar que el DOM está listo
    setTimeout(createChart, 50);
  });
  
  // Recrear gráfico si cambian los datos
  $: if (canvas && data?.length && labels?.length) {
    console.log('SimpleBarChart: Datos actualizados, recreando gráfico');
    setTimeout(createChart, 50);
  }
  
  onDestroy(() => {
    console.log('SimpleBarChart: Componente desmontado');
    // Limpiar al desmontar
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  });
</script>

<div class="chart-container" style="width: {figsize[0]}px; height: {figsize[1]}px; max-width: 100%;">
  {#if !data?.length || !labels?.length}
    <div class="flex items-center justify-center h-full bg-gray-50 rounded border border-gray-200">
      <p class="text-gray-500">No hay datos para visualizar</p>
    </div>
  {:else}
    <canvas id={chartId} bind:this={canvas}></canvas>
  {/if}
</div>

<style>
  .chart-container {
    margin: 0 auto;
    position: relative;
  }
</style>
