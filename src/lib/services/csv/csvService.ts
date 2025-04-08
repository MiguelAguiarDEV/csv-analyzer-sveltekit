import * as Papa from 'papaparse';

export interface CsvPreview {
	headers: string[];
	rows: Record<string, unknown>[];
	types: Record<string, string>;
}

export interface CsvParseOptions {
	header?: boolean;
	skipEmptyLines?: boolean;
	dynamicTyping?: boolean;
	preview?: number;
}

/**
 * Analiza un archivo CSV y devuelve una vista previa de los datos
 * @param csvText Texto del CSV a analizar
 * @param previewRows Número de filas a incluir en la vista previa
 */
export function parseCsv(csvText: string, previewRows: number = 5): CsvPreview {
	const result = Papa.parse<Record<string, unknown>>(csvText, {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: true
	});

	const types: Record<string, string> = {};

	// Detectar tipos analizando varias filas
	const typeSamples = Math.min(result.data.length, 10);
	if (result.meta.fields && result.data.length > 0) {
		for (const field of result.meta.fields) {
			const fieldTypes = new Set<string>();
			
			// Muestrear varias filas para detectar el tipo
			for (let i = 0; i < typeSamples; i++) {
				if (i < result.data.length) {
					const value = result.data[i][field];
					fieldTypes.add(typeof value);
				}
			}
			
			// Si todos los valores son del mismo tipo, usamos ese
			if (fieldTypes.size === 1) {
				types[field] = fieldTypes.values().next().value;
			} 
			// Si hay undefined/null y otro tipo, usamos el otro tipo
			else if (fieldTypes.size === 2 && (fieldTypes.has('undefined') || fieldTypes.has('object'))) {
				const otherType = Array.from(fieldTypes).find(t => t !== 'undefined' && t !== 'object');
				types[field] = otherType || 'mixed';
			} 
			// Tipo mixto
			else {
				types[field] = 'mixed';
			}
		}
	}

	return {
		headers: result.meta.fields || [],
		rows: result.data.slice(0, previewRows),
		types
	};
}

/**
 * Analiza un archivo CSV y devuelve todos los datos
 * @param csvText Texto del CSV a analizar
 */
export function parseFullCsv(csvText: string): Record<string, unknown>[] {
	const result = Papa.parse<Record<string, unknown>>(csvText, {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: true
	});

	return result.data;
}

/**
 * Obtiene estadísticas básicas de una columna numérica
 */
export function getColumnStats(
	data: Record<string, unknown>[], 
	column: string
): { min: number; max: number; avg: number; sum: number; count: number } {
	const numericValues = data
		.map(row => {
			const val = row[column];
			return typeof val === 'number' ? val : parseFloat(String(val));
		})
		.filter(val => !isNaN(val));

	if (numericValues.length === 0) {
		return { min: 0, max: 0, avg: 0, sum: 0, count: 0 };
	}

	const sum = numericValues.reduce((acc, val) => acc + val, 0);
	
	return {
		min: Math.min(...numericValues),
		max: Math.max(...numericValues),
		avg: sum / numericValues.length,
		sum,
		count: numericValues.length
	};
}

/**
 * Obtiene valores únicos de una columna
 */
export function getUniqueValues(
	data: Record<string, unknown>[], 
	column: string
): { value: unknown; count: number }[] {
	const valueMap = new Map<unknown, number>();
	
	data.forEach(row => {
		const value = row[column];
		valueMap.set(value, (valueMap.get(value) || 0) + 1);
	});
	
	return Array.from(valueMap.entries())
		.map(([value, count]) => ({ value, count }))
		.sort((a, b) => b.count - a.count);
}

/**
 * Agrupa datos por una columna y aplica una función de agregación a otra columna
 */
export function groupByAndAggregate(
	data: Record<string, unknown>[],
	groupByColumn: string,
	aggregateColumn: string,
	aggregateFunction: 'sum' | 'avg' | 'count' | 'min' | 'max' = 'sum'
): { group: unknown; value: number }[] {
	// Agrupar los datos
	const groups = new Map<unknown, number[]>();
	
	data.forEach(row => {
		const groupValue = row[groupByColumn];
		const value = row[aggregateColumn];
		const numValue = typeof value === 'number' ? value : parseFloat(String(value));
		
		if (!isNaN(numValue)) {
			if (!groups.has(groupValue)) {
				groups.set(groupValue, []);
			}
			groups.get(groupValue)?.push(numValue);
		}
	});
	
	// Aplicar la función de agregación a cada grupo
	return Array.from(groups.entries()).map(([group, values]) => {
		let aggregatedValue: number;
		
		switch (aggregateFunction) {
			case 'sum':
				aggregatedValue = values.reduce((acc, val) => acc + val, 0);
				break;
			case 'avg':
				aggregatedValue = values.reduce((acc, val) => acc + val, 0) / values.length;
				break;
			case 'count':
				aggregatedValue = values.length;
				break;
			case 'min':
				aggregatedValue = Math.min(...values);
				break;
			case 'max':
				aggregatedValue = Math.max(...values);
				break;
			default:
				aggregatedValue = values.reduce((acc, val) => acc + val, 0);
		}
		
		return { group, value: aggregatedValue };
	});
}

/**
 * Filtra datos según condiciones
 */
export function filterData(
	data: Record<string, unknown>[],
	filters: Array<{
		column: string;
		operator: 'greaterThan' | 'lessThan' | 'equals' | 'contains' | 'notEquals';
		value: any;
	}>,
	combineWith: 'and' | 'or' = 'and'
): Record<string, unknown>[] {
	return data.filter(row => {
		const results = filters.map(filter => {
			const value = row[filter.column];
			
			switch (filter.operator) {
				case 'greaterThan':
					return Number(value) > Number(filter.value);
				case 'lessThan':
					return Number(value) < Number(filter.value);
				case 'equals':
					return value == filter.value;
				case 'notEquals':
					return value != filter.value;
				case 'contains':
					return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
				default:
					return true;
			}
		});
		
		return combineWith === 'and'
			? results.every(result => result)
			: results.some(result => result);
	});
}

/**
 * Ordena los datos por una columna
 */
export function sortData(
	data: Record<string, unknown>[],
	sortColumn: string,
	direction: 'asc' | 'desc' = 'asc'
): Record<string, unknown>[] {
	return [...data].sort((a, b) => {
		const aValue = a[sortColumn];
		const bValue = b[sortColumn];
		
		// Intentar comparar como números si es posible
		if (typeof aValue === 'number' && typeof bValue === 'number') {
			return direction === 'asc' ? aValue - bValue : bValue - aValue;
		}
		
		// Comparar como strings
		const aString = String(aValue || '');
		const bString = String(bValue || '');
		
		return direction === 'asc'
			? aString.localeCompare(bString)
			: bString.localeCompare(aString);
	});
}

/**
 * Detecta automáticamente las mejores columnas para visualización
 */
export function detectVisualizationColumns(data: Record<string, unknown>[], types: Record<string, string>): {
	categoryColumns: string[];  // Buenas para el eje X
	numericColumns: string[];   // Buenas para el eje Y
	suggestedX: string;
	suggestedY: string;
} {
	const headers = Object.keys(types);
	const categoryColumns: string[] = [];
	const numericColumns: string[] = [];
	
	// Clasificar columnas
	headers.forEach(header => {
		const type = types[header];
		
		if (type === 'number') {
			numericColumns.push(header);
		} else if (type === 'string' || type === 'mixed') {
			// Contar valores únicos para determinar si es categórica
			const uniqueValues = new Set();
			for (const row of data) {
				uniqueValues.add(row[header]);
			}
			
			// Si tiene pocos valores únicos (menos del 20% del total de filas)
			// y no son demasiados (menos de 30), considerarla categórica
			if (uniqueValues.size < Math.min(data.length * 0.2, 30)) {
				categoryColumns.push(header);
			}
		}
	});
	
	// Sugerir columnas para visualización
	let suggestedX = categoryColumns[0] || headers[0];
	let suggestedY = numericColumns[0] || headers.find(h => h !== suggestedX) || '';
	
	return {
		categoryColumns,
		numericColumns,
		suggestedX,
		suggestedY
	};
}
