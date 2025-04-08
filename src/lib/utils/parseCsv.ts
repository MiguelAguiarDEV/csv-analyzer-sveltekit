import * as Papa from 'papaparse';

export interface CsvPreview {
	headers: string[];
	rows: Record<string, unknown>[];
	types: Record<string, string>;
}

export function parseCsv(csvText: string): CsvPreview {
	const result = Papa.parse<Record<string, unknown>>(csvText, {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: true
	});

	const sampleRow = result.data[0];
	const types: Record<string, string> = {};

	if (sampleRow) {
		for (const key of Object.keys(sampleRow)) {
			const value = sampleRow[key];
			types[key] = typeof value;
		}
	}

	return {
		headers: result.meta.fields || [],
		rows: result.data.slice(0, 5),
		types
	};
}
