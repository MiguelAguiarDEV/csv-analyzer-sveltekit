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

<div class="bg-theme-primary border-theme-primary space-y-4 rounded-lg border p-5">
	<h3 class="border-theme-primary text-theme-primary mb-4 border-b pb-2 text-lg font-semibold">
		Configuración del Gráfico
	</h3>

	<!-- Tipo de gráfico -->
	<div class="space-y-2">
		<label class="text-theme-primary block text-sm font-medium">Tipo de gráfico</label>
		<select
			bind:value={chartType}
			class="border-theme-primary focus:ring-accent-primary focus:border-accent-primary mt-1 block w-full rounded-md border py-2 pr-10 pl-3 text-base focus:outline-none"
		>
			<option value="bar">Gráfico de Barras</option>
			<option value="line">Gráfico de Líneas</option>
			<option value="pie">Gráfico Circular</option>
		</select>
	</div>

	<!-- Selección de columnas -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<!-- Columna para eje X -->
		<div class="space-y-2">
			<label class="text-theme-primary block text-sm font-medium">
				{chartType === 'pie' ? 'Columna para categorías' : 'Columna para eje X'}
			</label>
			<select
				bind:value={xColumn}
				class="border-theme-primary focus:ring-accent-primary focus:border-accent-primary mt-1 block w-full rounded-md border py-2 pr-10 pl-3 text-base focus:outline-none"
			>
				<option value="">Selecciona una columna</option>
				{#each categoricColumns as column}
					<option value={column}>{column}</option>
				{/each}
				{#if categoricColumns.length === 0}
					{#each headers as column}
						<option value={column}>{column}</option>
					{/each}
				{/if}
			</select>
		</div>

		<!-- Columna para eje Y -->
		<div class="space-y-2">
			<label class="text-theme-primary block text-sm font-medium">
				{chartType === 'pie' ? 'Columna para valores' : 'Columna para eje Y'}
			</label>
			<select
				bind:value={yColumn}
				class="border-theme-primary focus:ring-accent-primary focus:border-accent-primary mt-1 block w-full rounded-md border py-2 pr-10 pl-3 text-base focus:outline-none"
			>
				<option value="">Selecciona una columna</option>
				{#each numericColumns as column}
					<option value={column}>{column}</option>
				{/each}
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
		<label class="text-theme-primary block text-sm font-medium">Título del gráfico</label>
		<input
			type="text"
			bind:value={title}
			placeholder="Ingresa un título descriptivo"
			class="border-theme-primary focus:ring-accent-primary focus:border-accent-primary mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none"
		/>
	</div>

	<!-- Opciones específicas según tipo de gráfico -->
	{#if chartType === 'bar'}
		<!-- Opciones específicas para barras -->
		<div class="space-y-2">
			<label class="text-theme-primary block text-sm font-medium">Orientación</label>
			<div class="flex items-center space-x-4">
				<label class="inline-flex items-center">
					<input type="radio" bind:group={horizontal} value={false} class="text-accent-primary" />
					<span class="text-theme-primary ml-2">Vertical</span>
				</label>
				<label class="inline-flex items-center">
					<input type="radio" bind:group={horizontal} value={true} class="text-accent-primary" />
					<span class="text-theme-primary ml-2">Horizontal</span>
				</label>
			</div>
		</div>
	{/if}

	{#if chartType === 'line'}
		<!-- Opciones específicas para líneas -->
		<div class="space-y-2">
			<label class="text-theme-primary block text-sm font-medium">Opciones de línea</label>
			<div class="flex items-center space-x-4">
				<label class="inline-flex items-center">
					<input type="checkbox" class="text-accent-primary" />
					<span class="text-theme-primary ml-2">Mostrar puntos</span>
				</label>
				<label class="inline-flex items-center">
					<input type="checkbox" class="text-accent-primary" />
					<span class="text-theme-primary ml-2">Rellenar área</span>
				</label>
			</div>
		</div>
	{/if}

	<!-- Opciones comunes -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<!-- Ordenamiento -->
		<div class="space-y-2">
			<label class="text-theme-primary block text-sm font-medium">Ordenar por</label>
			<div class="flex space-x-2">
				<select
					bind:value={sortBy}
					class="border-theme-primary focus:ring-accent-primary focus:border-accent-primary mt-1 block w-3/4 rounded-md border py-2 pr-10 pl-3 text-base focus:outline-none"
				>
					<option value="none">Sin ordenar</option>
					<option value="value">Valor</option>
					<option value="label">Etiqueta</option>
				</select>

				{#if sortBy !== 'none'}
					<select
						bind:value={sortAscending}
						class="border-theme-primary focus:ring-accent-primary focus:border-accent-primary mt-1 block w-1/4 rounded-md border py-2 pr-10 pl-3 text-base focus:outline-none"
					>
						<option value={false}>↓</option>
						<option value={true}>↑</option>
					</select>
				{/if}
			</div>
		</div>

		<!-- Limitación -->
		<div class="space-y-2">
			<label class="text-theme-primary block text-sm font-medium">Limitar a</label>
			<input
				type="number"
				bind:value={limit}
				min="0"
				placeholder="0 = sin límite"
				class="border-theme-primary focus:ring-accent-primary focus:border-accent-primary mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none"
			/>
		</div>
	</div>

	<!-- Color -->
	<div class="space-y-2">
		<label class="text-theme-primary block text-sm font-medium">Color</label>
		<div class="flex space-x-2">
			<input type="color" bind:value={colorScheme} class="h-10 w-10 cursor-pointer rounded" />
			<input
				type="text"
				bind:value={colorScheme}
				placeholder="#RRGGBB"
				class="border-theme-primary focus:ring-accent-primary focus:border-accent-primary mt-1 block flex-1 rounded-md border px-3 py-2 focus:outline-none"
			/>
		</div>
	</div>

	<!-- Botón de generación -->
	<div class="pt-3">
		<button
			on:click={generateGraph}
			class="bg-accent-primary hover:bg-accent-secondary focus:ring-accent-primary flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
		>
			Generar Gráfico
		</button>
	</div>
</div>
