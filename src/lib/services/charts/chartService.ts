import type { ChartConfiguration } from 'chart.js';
import type { ChartType } from '$lib/types/charts';

/**
 * Servicio para operaciones relacionadas con gráficos
 */
export function createBarChartConfig(
	labels: string[],
	data: number[],
	options: {
		title?: string;
		xAxisLabel?: string;
		yAxisLabel?: string;
		colors?: string[];
		horizontal?: boolean;
		showGrid?: boolean;
		showLegend?: boolean;
	} = {}
): ChartConfiguration {
	const {
		title = 'Gráfico de Barras',
		xAxisLabel = 'Categoría',
		yAxisLabel = 'Valor',
		colors = ['rgba(54, 162, 235, 0.8)'],
		horizontal = false,
		showGrid = true,
		showLegend = false
	} = options;

	// Si solo hay un color pero múltiples valores, repetimos el color
	const backgroundColors = colors.length === 1 && data.length > 1 
		? Array(data.length).fill(colors[0])
		: colors;

	return {
		type: horizontal ? 'horizontalBar' : 'bar',
		data: {
			labels,
			datasets: [
				{
					label: yAxisLabel,
					data,
					backgroundColor: backgroundColors,
					borderColor: backgroundColors.map(color => color.replace(/[^,]+(?=\))/, '1')),
					borderWidth: 1,
					borderRadius: 6
				}
			]
		},
		options: {
			indexAxis: horizontal ? 'y' : 'x',
			responsive: true,
			plugins: {
				title: {
					display: !!title,
					text: title,
					font: { size: 16, weight: 'bold' },
					padding: { top: 10, bottom: 20 }
				},
				legend: { 
					display: showLegend,
					position: 'top'
				},
				tooltip: {
					callbacks: {
						label: function(context) {
							let label = context.dataset.label || '';
							if (label) {
								label += ': ';
							}
							if (context.parsed.y !== null) {
								label += new Intl.NumberFormat('es-ES').format(
									horizontal ? context.parsed.x : context.parsed.y
								);
							}
							return label;
						}
					}
				}
			},
			scales: {
				x: {
					title: { 
						display: true, 
						text: horizontal ? yAxisLabel : xAxisLabel,
						font: { weight: 'bold' }
					},
					grid: {
						display: showGrid && !horizontal
					},
					ticks: {
						maxRotation: 45,
						minRotation: 45,
					}
				},
				y: {
					title: { 
						display: true, 
						text: horizontal ? xAxisLabel : yAxisLabel,
						font: { weight: 'bold' }
					},
					grid: {
						display: showGrid && horizontal
					},
					beginAtZero: true
				}
			}
		}
	};
}

/**
 * Determina si un gráfico debería ser horizontal basado en los datos
 */
export function shouldBeHorizontal(labels: string[]): boolean {
	// Si hay muchas categorías o las etiquetas son largas, usar horizontal
	return labels.length > 8 || labels.some(label => label.length > 15);
}

/**
 * Genera una paleta de colores basada en un color principal
 */
export function generateColorPalette(baseColor: string, count: number): string[] {
	if (count <= 1) return [baseColor];
	
	// Colores predefinidos que combinan bien
	const predefinedPalettes: Record<string, string[]> = {
		'#4F46E5': ['#4F46E5', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'], // Indigo
		'#10B981': ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'], // Emerald
		'#EF4444': ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'], // Red
		'#F59E0B': ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'], // Amber
		'#6366F1': ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF']  // Indigo
	};
	
	// Usar paleta predefinida si existe
	if (predefinedPalettes[baseColor] && predefinedPalettes[baseColor].length >= count) {
		return predefinedPalettes[baseColor].slice(0, count);
	}
	
	// Fallback: devolver el color base repetido
	return Array(count).fill(baseColor);
}

/**
 * Sugiere un título para el gráfico basado en las columnas utilizadas
 */
export function suggestChartTitle(xColumn: string, yColumn: string, chartType: ChartType = 'bar'): string {
	const typeText = chartType === 'bar' 
		? 'Gráfico de Barras' 
		: chartType === 'line' 
			? 'Gráfico de Línea' 
			: 'Gráfico de Pastel';
			
	return `${typeText}: ${yColumn} por ${xColumn}`;
}
