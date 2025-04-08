export interface ChartOptions {
	xAxis: string;
	yAxis: string;
	title?: string;
	color?: string;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';

export interface ChartData {
	labels: string[];
	values: number[];
	type: ChartType;
	options: ChartOptions;
}
