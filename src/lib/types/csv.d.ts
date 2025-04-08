export interface CsvData {
	headers: string[];
	rows: Record<string, unknown>[];
	types: Record<string, string>;
}

export interface CsvParseOptions {
	header?: boolean;
	skipEmptyLines?: boolean;
	dynamicTyping?: boolean;
}
