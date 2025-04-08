export function generateChartPrompt(csv: string): string {
	return `
Analiza el siguiente CSV y sugiere una visualización de tipo "bar".
Devuelve un JSON como este:
{
  "type": "bar",
  "xColumn": "nombre_de_columna_categorica",
  "yColumn": "nombre_de_columna_numerica"
}
Asegúrate de que las columnas existan en el CSV.

CSV:
${csv}
`.trim();
}

export function generateConclusionPrompt(csv: string, xCol: string, yCol: string): string {
	return `
Con base en los siguientes datos CSV, analiza la relación entre las columnas "${xCol}" y "${yCol}".
Proporciona una conclusión breve y clara en lenguaje natural, como si fueras un analista de datos.

CSV:
${csv}
`.trim();
}
