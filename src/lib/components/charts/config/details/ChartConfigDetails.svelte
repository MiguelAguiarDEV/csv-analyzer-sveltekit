<script lang="ts">
	import type { ChartConfig } from '$lib/services/charts/chartProcessingService';

	export let config: ChartConfig;
	export let expanded: boolean = false;

	function getOperatorText(operator: string): string {
		switch (operator) {
			case 'greaterThan': return 'mayor que';
			case 'lessThan': return 'menor que';
			case 'equals': return 'igual a';
			case 'notEquals': return 'diferente de';
			case 'contains': return 'contiene';
			default: return operator;
		}
	}

	function getSortText(sort: {by?: string; direction?: string}): string {
		if (!sort.by || sort.by === 'none') return 'Sin ordenar';
		
		const direction = sort.direction === 'asc' ? 'ascendente' : 'descendente';
		const by = sort.by === 'value' ? 'valor' : 'etiqueta';
		
		return `Ordenado por ${by} ${direction}`;
	}

	function getLimitText(limit: {enabled?: boolean; count?: number; strategy?: string}): string {
		if (!limit.enabled) return 'Sin límite';
		
		const strategy = limit.strategy === 'top' 
			? 'mayores' 
			: limit.strategy === 'bottom' 
				? 'menores' 
				: 'aleatorios';
		
		return `Mostrando los ${limit.count} ${strategy}`;
	}

	function getFilterText(filter: {enabled?: boolean; rules?: any[]}): string {
		if (!filter.enabled || !filter.rules?.length) return 'Sin filtros';
		
		return `${filter.rules.length} ${filter.rules.length === 1 ? 'filtro' : 'filtros'} aplicado${filter.rules.length === 1 ? '' : 's'}`;
	}

	function toggleExpand() {
		expanded = !expanded;
	}
</script>

<div class="border border-gray-200 rounded-lg overflow-hidden bg-white">
	<div 
		class="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200 cursor-pointer"
		on:click={toggleExpand}
	>
		<div class="font-medium">Configuración del gráfico</div>
		<button class="text-gray-500 hover:text-gray-700">
			{#if expanded}
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			{/if}
		</button>
	</div>
	
	{#if !expanded}
		<div class="p-3 text-sm text-gray-600 grid grid-cols-2 gap-2">
			<div class="flex items-center">
				<span class="font-medium mr-2">Tipo:</span>
				<span>{config.type}</span>
			</div>
			<div class="flex items-center">
				<span class="font-medium mr-2">Ordenamiento:</span>
				<span>{getSortText(config.configuration?.sort || {})}</span>
			</div>
			<div class="flex items-center">
				<span class="font-medium mr-2">Límite:</span>
				<span>{getLimitText(config.configuration?.limit || {})}</span>
			</div>
			<div class="flex items-center">
				<span class="font-medium mr-2">Filtros:</span>
				<span>{getFilterText(config.configuration?.filter || {})}</span>
			</div>
		</div>
	{:else}
		<div class="p-4 text-sm border-b border-gray-200">
			<h3 class="font-semibold text-base mb-3">Detalles de configuración</h3>
			
			<div class="mb-4">
				<h4 class="font-medium mb-1 text-gray-700">Datos</h4>
				<div class="grid grid-cols-2 gap-x-4 gap-y-2 ml-2">
					<div>
						<span class="font-medium text-gray-600">Eje X:</span>
						<span class="ml-1">{config.xColumn}</span>
					</div>
					<div>
						<span class="font-medium text-gray-600">Eje Y:</span>
						<span class="ml-1">{config.yColumn}</span>
					</div>
				</div>
			</div>
			
			<div class="mb-4">
				<h4 class="font-medium mb-1 text-gray-700">Ordenamiento</h4>
				{#if config.configuration?.sort?.by !== 'none'}
					<div class="ml-2">
						<div>Ordenado por <span class="font-medium">{config.configuration?.sort?.by === 'value' ? 'valor' : 'etiqueta'}</span></div>
						<div>Dirección: <span class="font-medium">{config.configuration?.sort?.direction === 'asc' ? 'ascendente' : 'descendente'}</span></div>
					</div>
				{:else}
					<div class="ml-2 text-gray-500">Sin ordenamiento aplicado</div>
				{/if}
			</div>
			
			<div class="mb-4">
				<h4 class="font-medium mb-1 text-gray-700">Límites</h4>
				{#if config.configuration?.limit?.enabled}
					<div class="ml-2">
						<div>Mostrando <span class="font-medium">{config.configuration.limit.count}</span> elementos</div>
						<div>Estrategia: <span class="font-medium">
							{config.configuration.limit.strategy === 'top' 
								? 'valores más altos' 
								: config.configuration.limit.strategy === 'bottom' 
									? 'valores más bajos' 
									: 'elementos aleatorios'}
						</span></div>
					</div>
				{:else}
					<div class="ml-2 text-gray-500">Sin límites aplicados</div>
				{/if}
			</div>
			
			<div class="mb-4">
				<h4 class="font-medium mb-1 text-gray-700">Filtros</h4>
				{#if config.configuration?.filter?.enabled && config.configuration.filter.rules?.length}
					<div class="ml-2">
						<div class="mb-1">Reglas de filtrado:</div>
						<ul class="list-disc ml-5">
							{#each config.configuration.filter.rules as rule}
								<li>
									<span class="font-medium">{rule.column}</span> {getOperatorText(rule.operator)} <span class="font-medium">{rule.value}</span>
								</li>
							{/each}
						</ul>
						{#if config.configuration.filter.rules.length > 1}
							<div class="mt-1">
								Combinación: <span class="font-medium">{config.configuration.filter.combineWith === 'and' ? 'todas las reglas deben cumplirse' : 'al menos una regla debe cumplirse'}</span>
							</div>
						{/if}
					</div>
				{:else}
					<div class="ml-2 text-gray-500">Sin filtros aplicados</div>
				{/if}
			</div>
			
			<div>
				<h4 class="font-medium mb-1 text-gray-700">Estilo</h4>
				<div class="grid grid-cols-2 gap-x-4 gap-y-2 ml-2">
					<div>
						<span class="font-medium text-gray-600">Colores:</span>
						<div class="flex mt-1 space-x-1">
							{#each config.configuration?.style?.colors || [] as color}
								<div class="w-5 h-5 rounded" style="background-color: {color}"></div>
							{/each}
						</div>
					</div>
					<div>
						<span class="font-medium text-gray-600">Líneas de cuadrícula:</span>
						<span class="ml-1">{config.configuration?.style?.showGridLines ? 'Sí' : 'No'}</span>
					</div>
					<div>
						<span class="font-medium text-gray-600">Leyenda:</span>
						<span class="ml-1">{config.configuration?.style?.showLegend ? 'Visible' : 'Oculta'}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
