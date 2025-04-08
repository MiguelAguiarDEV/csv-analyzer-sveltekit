/**
 * Prompts para generar visualizaciones con IA
 */

/**
 * Genera un prompt para solicitar configuración de gráfico a la IA
 */
export function generateBarChartPrompt(csvText: string, columns: string[]): string {
  // Obtener una pequeña muestra del CSV para contexto (primeras 5 líneas)
  const sampleLines = csvText.split('\n').slice(0, 6).join('\n');
  
  return `
Eres un experto en visualización de datos y análisis. Examina el siguiente CSV y sugiere la mejor configuración para un gráfico de barras.

MUESTRA DE DATOS CSV (primeras 5 filas):
${sampleLines}

COLUMNAS DISPONIBLES:
${columns.join(', ')}

INSTRUCCIONES:
1. Analiza cuidadosamente los datos
2. Identifica qué columnas serían mejores para los ejes X e Y
   - Eje X: Normalmente una columna categórica (nombres, tipos, etc.)
   - Eje Y: Normalmente una columna numérica (valores, conteos, etc.)
3. Decide si es mejor ordenar o limitar los datos para una mejor visualización
4. Sugiere un título descriptivo y etiquetas para los ejes

Devuelve SOLO un objeto JSON con la siguiente estructura exacta (sin explicaciones adicionales):
{
  "x": "nombre_columna_para_eje_x",
  "y": "nombre_columna_para_eje_y",
  "title": "Título descriptivo del gráfico",
  "xlabel": "Etiqueta para eje X",
  "ylabel": "Etiqueta para eje Y",
  "kind": "bar",
  "color": "#4F46E5",
  "horizontal": false,
  "sort_by": "y",
  "sort_ascending": false,
  "limit": 10
}
`;
}

/**
 * Genera un prompt para solicitar insights sobre los datos visualizados
 */
export function generateInsightsPrompt(csvText: string, chartConfig: any): string {
  return `
Analiza los siguientes datos y la configuración del gráfico generado.
Proporciona 3-5 insights clave que se pueden extraer de esta visualización.

Configuración del gráfico:
${JSON.stringify(chartConfig, null, 2)}

Para cada insight:
1. Describe claramente lo que muestran los datos
2. Explica por qué es importante o relevante
3. Sugiere posibles acciones o decisiones que podrían tomarse basadas en esto

CSV:
${csvText}
`;
}

/**
 * Genera un prompt para obtener una conclusión basada en los datos
 */
export function generateConclusionPrompt(csvText: string, xColumn: string, yColumn: string): string {
  return `
Con base en los siguientes datos CSV, analiza la relación entre las columnas "${xColumn}" y "${yColumn}".
Proporciona una conclusión breve y clara en lenguaje natural, como si fueras un analista de datos.

Incluye en tu análisis:
1. Tendencias principales que se observan
2. Valores atípicos o datos interesantes 
3. Posibles correlaciones
4. Recomendaciones basadas en los datos (si aplica)

Tu conclusión debe ser concisa pero informativa, evitando jerga técnica innecesaria.

CSV:
${csvText}
`;
}
