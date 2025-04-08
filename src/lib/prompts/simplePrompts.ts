/**
 * Prompts simplificados para interactuar con la IA
 */

/**
 * Solicita a la IA que seleccione las columnas adecuadas para un gráfico de barras
 */
export function generateBarChartPrompt(csvText: string, columnInfo: any) {
  console.log("[SimplePrompts] Generando prompt para gráfico de barras");
  
  const cleanCsv = csvText.substring(0, 1500); // Limitar tamaño para evitar tokens excesivos
  
  return `
Eres un experto en visualización de datos. Analiza el siguiente CSV y proporciona la mejor configuración para un gráfico de barras.

Información de las columnas:
${JSON.stringify(columnInfo, null, 2)}

Responde ÚNICAMENTE con un objeto JSON con el siguiente formato:
{
  "title": "Título descriptivo para el gráfico",
  "xColumn": "nombre_columna_para_eje_x",
  "yColumn": "nombre_columna_para_eje_y",
  "xAxisLabel": "Etiqueta para el eje X",
  "yAxisLabel": "Etiqueta para el eje Y",
  "color": "#hexcolor",
  "description": "Breve descripción del gráfico y los datos"
}

Para un gráfico de barras, el eje X debería ser una columna categórica (con pocos valores únicos) y el eje Y debería ser numérico.
Selecciona las columnas más interesantes que podrían revelar información valiosa.

Primeras líneas del CSV:
${cleanCsv}
`.trim();
}

/**
 * Solicita a la IA que proporcione insights sobre el gráfico generado
 */
export function generateInsightsPrompt(csvText: string, chartConfig: any) {
  console.log("[SimplePrompts] Generando prompt para insights", chartConfig);
  
  return `
Analiza los siguientes datos y la configuración del gráfico de barras generado.
Proporciona 3-5 insights clave basados en este gráfico, destacando patrones importantes, anomalías o conclusiones.

Configuración del gráfico:
${JSON.stringify(chartConfig, null, 2)}

Para cada insight:
1. Describe claramente lo que muestran los datos
2. Explica por qué es importante
3. Sugiere posibles acciones basadas en esta información

CSV:
${csvText.substring(0, 1500)}
`.trim();
}

/**
 * Solicita a la IA que proporcione una conclusión sobre los datos visualizados
 */
export function generateConclusionPrompt(csvText: string, xColumn: string, yColumn: string) {
  console.log("[SimplePrompts] Generando prompt para conclusión", { xColumn, yColumn });
  
  return `
Analiza los siguientes datos CSV, enfocándote en la relación entre las columnas "${xColumn}" y "${yColumn}".
Proporciona una conclusión concisa (3-4 oraciones) que resuma los principales hallazgos y lo que estos datos nos dicen.

Las conclusiones deben ser objetivas, basadas en datos y fáciles de entender. Evita jerga técnica innecesaria.

CSV:
${csvText.substring(0, 1500)}
`.trim();
}
