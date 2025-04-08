<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let csvData: Record<string, any>[] = [];
  export let headers: string[] = [];
  export let chartType: 'bar' | 'line' | 'pie' = 'bar';
  
  // Estado local
  let xColumn = '';
  let yColumn = '';
  let title = '';
  let horizontal = false;
  let sortBy: 'none' | 'value' | 'label' = 'none';
  let sortAscending = false;
  let limit = 0;
  let colorScheme = '#4F46E5';
  let groupBy = false;
  
  // Detectar columnas numéricas y categóricas
  let numericColumns: string[] = [];
  let categoricColumns: string[] = [];
  
  // Eventos
  const dispatch = createEventDispatcher();
  
  // Cuando cambian los datos, actualizar columnas detectadas
  $: if (csvData && csvData.length && headers.length) {
    detectColumnTypes();
    setDefaultColumns();
  }
  
  // Cuando cambia el tipo de gráfico, ajustar opciones
  $: if (chartType) {
    adjustOptionsForChartType();
  }
  
  // Funciones
  function detectColumnTypes() {
    numericColumns = [];
    categoricColumns = [];
    
    // Analizar primeras 10 filas para detectar tipos
    const sampleSize = Math.min(10, csvData.length);
    
    for (const header of headers) {
      let numericCount = 0;
      
      for (let i = 0; i < sampleSize; i++) {
        const value = csvData[i][header];
        if (typeof value === 'number' || !isNaN(Number(value))) {
          numericCount++;
        }
      }
      
      // Si al menos 70% son numéricos, consideramos columna numérica
      if (numericCount / sampleSize >= 0.7) {
        numericColumns.push(header);
      } else {
        categoricColumns.push(header);
      }
    }
    
    console.log('Columnas detectadas:', {
      numéricas: numericColumns,
      categóricas: categoricColumns
    });
  }
  
  function setDefaultColumns() {
    // Configurar columnas por defecto según el tipo de gráfica
    if (chartType === 'bar' || chartType === 'line') {
      if (!xColumn && categoricColumns.length) {
        xColumn = categoricColumns[0];
      }
      if (!yColumn && numericColumns.length) {
        yColumn = numericColumns[0];
      }
    } else if (chartType === 'pie') {
      if (!xColumn && categoricColumns.length) {
        xColumn = categoricColumns[0];
      }
      if (!yColumn && numericColumns.length) {
        yColumn = numericColumns[0];
      }
      // Para gráficos de pastel siempre habilitamos agrupación
      groupBy = true;
    }
    
    // Título automático
    if (!title && xColumn && yColumn) {
      title = `${yColumn} por ${xColumn}`;
    }
  }
  
  function adjustOptionsForChartType() {
    if (chartType === 'bar') {
      // Configuraciones específicas para gráficos de barras
      horizontal = categoricColumns.length > 8; // Auto-horizontal si hay muchas categorías
    } else if (chartType === 'line') {
      // Configuraciones específicas para gráficos de líneas
      horizontal = false; // Líneas siempre verticales
      sortBy = 'label'; // Ordenar por etiqueta es común en líneas
      sortAscending = true;
    } else if (chartType === 'pie') {
      // Configuraciones específicas para gráficos de pastel
      horizontal = false;
      groupBy = true;
      // Limitar automáticamente a 10 si hay muchas categorías
      if (categoricColumns.length > 10 && limit === 0) {
        limit = 10;
        sortBy = 'value';
        sortAscending = false;
      }
    }
  }
  
  function generateGraph() {
    if (!xColumn || !yColumn) {
      alert('Debes seleccionar columnas para los ejes X e Y');
      return;
    }
    
    // Crear configuración
    const config = {
      chartType,
      xColumn,
      yColumn,
      title,
      horizontal,
      sortBy,
      sortAscending,
      limit,
      colorScheme,
      groupBy
    };
    
    console.log('Configuración generada:', config);
    
    // Emitir evento
    dispatch('generate', config);
  }
</script>

<div class="p-5 bg-white rounded-lg border border-gray-200 space-y-4">
  <h3 class="font-semibold text-lg border-b pb-2 mb-4">Configuración del Gráfico</h3>
  
  <!-- Tipo de gráfico -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">Tipo de gráfico</label>
    <select
      bind:value={chartType}
      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="bar">Gráfico de Barras</option>
      <option value="line">Gráfico de Líneas</option>
      <option value="pie">Gráfico Circular</option>
    </select>
  </div>
  
  <!-- Selección de columnas -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Columna para eje X -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        {chartType === 'pie' ? 'Columna para categorías' : 'Columna para eje X'}
      </label>
      <select
        bind:value={xColumn}
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Selecciona una columna</option>
        {#each categoricColumns as column}
          <option value={column}>{column}</option>
        {/each}
        <!-- Si no hay categóricas, permitir cualquier columna -->
        {#if categoricColumns.length === 0}
          {#each headers as column}
            <option value={column}>{column}</option>
          {/each}
        {/if}
      </select>
    </div>
    
    <!-- Columna para eje Y -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        {chartType === 'pie' ? 'Columna para valores' : 'Columna para eje Y'}
      </label>
      <select
        bind:value={yColumn}
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Selecciona una columna</option>
        {#each numericColumns as column}
          <option value={column}>{column}</option>
        {/each}
        <!-- Si no hay numéricas, permitir cualquier columna -->
        {#if numericColumns.length === 0}
          {#each headers as column}
            <option value={column}>{column}</option>
          {/each}
        {/if}
      </select>
    </div>
  </div>
  
  <!-- Título -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">Título del gráfico</label>
    <input
      type="text"
      bind:value={title}
      placeholder="Ingresa un título descriptivo"
      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
  
  <!-- Opciones específicas según tipo de gráfico -->
  {#if chartType === 'bar'}
    <!-- Opciones específicas para barras -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Orientación</label>
      <div class="flex items-center space-x-4">
        <label class="inline-flex items-center">
          <input type="radio" bind:group={horizontal} value={false} class="text-blue-600">
          <span class="ml-2">Vertical</span>
        </label>
        <label class="inline-flex items-center">
          <input type="radio" bind:group={horizontal} value={true} class="text-blue-600">
          <span class="ml-2">Horizontal</span>
        </label>
      </div>
    </div>
  {/if}
  
  {#if chartType === 'line'}
    <!-- Opciones específicas para líneas -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Opciones de línea</label>
      <div class="flex items-center space-x-4">
        <label class="inline-flex items-center">
          <input type="checkbox" class="text-blue-600">
          <span class="ml-2">Mostrar puntos</span>
        </label>
        <label class="inline-flex items-center">
          <input type="checkbox" class="text-blue-600">
          <span class="ml-2">Rellenar área</span>
        </label>
      </div>
    </div>
  {/if}
  
  <!-- Opciones comunes -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Ordenamiento -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Ordenar por</label>
      <div class="flex space-x-2">
        <select
          bind:value={sortBy}
          class="mt-1 block w-3/4 pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="none">Sin ordenar</option>
          <option value="value">Valor</option>
          <option value="label">Etiqueta</option>
        </select>
        
        {#if sortBy !== 'none'}
          <select
            bind:value={sortAscending}
            class="mt-1 block w-1/4 pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={false}>↓</option>
            <option value={true}>↑</option>
          </select>
        {/if}
      </div>
    </div>
    
    <!-- Limitación -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Limitar a</label>
      <input
        type="number"
        bind:value={limit}
        min="0"
        placeholder="0 = sin límite"
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
  
  <!-- Color -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">Color</label>
    <div class="flex space-x-2">
      <input
        type="color"
        bind:value={colorScheme}
        class="h-10 w-10 rounded cursor-pointer"
      />
      <input
        type="text"
        bind:value={colorScheme}
        placeholder="#RRGGBB"
        class="flex-1 mt-1 block px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
  
  <!-- Botón de generación -->
  <div class="pt-3">
    <button
      on:click={generateGraph}
      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Generar Gráfico
    </button>
  </div>
</div>
