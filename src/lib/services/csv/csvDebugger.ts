/**
 * Utilidad para depurar problemas con datos CSV
 */

/**
 * Analiza un CSV y muestra información detallada para depuración
 */
export function debugCsvData(csvText: string) {
	try {
		// Extraer las primeras líneas para analizar
		const lines = csvText.split('\n').slice(0, 10);

		// Analizar estructura básica
		const headers = lines[0].split(',').map((h) => h.trim());

		console.group('Depuración de CSV');
		console.log('Headers detectados:', headers);
		console.log('Primeras líneas:');

		// Mostrar primeras líneas formateadas
		lines.slice(1, 5).forEach((line, index) => {
			const values = line.split(',').map((v) => v.trim());
			const row = {};

			headers.forEach((header, i) => {
				row[header] = values[i] || '';
			});

			console.log(`Fila ${index + 1}:`, row);
		});

		// Detectar posibles problemas
		const headerProblems = headers.filter((h) => !h || h.includes(' ') || h.includes('\r'));
		if (headerProblems.length) {
			console.warn('Headers problemáticos:', headerProblems);
		}

		// Analizar consistencia de datos
		const rowLengths = lines.slice(1, 5).map((line) => line.split(',').length);

		if (new Set(rowLengths).size > 1) {
			console.warn('Longitud de filas inconsistente:', rowLengths);
		}

		console.groupEnd();

		return {
			headers,
			rowLengths,
			problems: headerProblems.length > 0 || new Set(rowLengths).size > 1
		};
	} catch (error) {
		console.error('Error analizando CSV:', error);
		return { error };
	}
}

/**
 * Corrige problemas comunes del CSV antes de procesarlo
 */
export function sanitizeCsvData(csvText: string): string {
	// Eliminar comillas extra y espacios al final de líneas
	let fixed = csvText.replace(/\r/g, '').trim();

	// Asegurar que todas las líneas terminan correctamente
	fixed = fixed.replace(/[^\n],$/g, '\n');

	// Eliminar líneas vacías
	fixed = fixed
		.split('\n')
		.filter((line) => line.trim())
		.join('\n');

	return fixed;
}
