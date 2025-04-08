export function generateChartPrompt(csv: string): string {
	return `
Eres un experto analista de datos. Analiza el siguiente CSV y sugiere la mejor visualización posible.

Considera los tipos de datos, las relaciones entre columnas, y qué historia podrían contar los datos.
Trata de encontrar patrones, tendencias o insights interesantes en los datos.

Devuelve un JSON con el siguiente formato:
{
  "type": "bar", // Tipo de gráfico: "bar", "line", "pie" (por ahora solo soportamos "bar")
  "title": "Título descriptivo para el gráfico",
  "xColumn": "nombre_de_columna_para_eje_x",
  "yColumn": "nombre_de_columna_para_eje_y",
  "sortBy": "value", // Opcional: "value" (por valor), "label" (alfabético), "none" (sin ordenar)
  "sortDirection": "desc", // Opcional: "asc" o "desc"
  "limit": 10, // Opcional: limitar a N elementos (útil si hay muchos datos)
  "colors": ["#4F46E5"], // Opcional: colores personalizados en formato hex
  "dataFilter": { // Opcional: criterios para filtrar datos
    "column": "nombre_columna_a_filtrar",
    "condition": "mayor_que", // "mayor_que", "menor_que", "igual_a", "contiene"
    "value": 100 // Valor para la condición
  }
}

Asegúrate de que las columnas existan en el CSV y que los tipos sean compatibles (ej. no pongas texto en el eje Y).
Intenta recomendar configuraciones que revelen insights interesantes en los datos.

CSV:
${csv}
`.trim();
}

export function generateAdvancedChartPrompt(csv: string): string {
	return `
Eres un experto analista de datos. Analiza el siguiente CSV y sugiere la mejor visualización posible.

INSTRUCCIONES DETALLADAS:
1. Examina cuidadosamente los datos, identificando tipos de columnas y posibles relaciones.
2. Identifica columnas que serían buenos candidatos para ejes X e Y basándote en:
   - Tipos de datos (categorías para eje X, valores numéricos para eje Y)
   - Distribución de datos (evita columnas con demasiados valores únicos para el eje X)
   - Potencial para mostrar insights interesantes
3. Determina si es mejor limitar, ordenar o filtrar los datos para mejorar la visualización.
4. Genera un título descriptivo que explique qué muestra el gráfico.

Devuelve un JSON con la siguiente estructura:
{
  "type": "bar", // Solo "bar" por ahora, pero argumenta si otro sería mejor
  "title": "Título descriptivo y específico del gráfico",
  "description": "Breve explicación de por qué elegiste esta visualización",
  "xColumn": "nombre_columna_para_eje_x",
  "yColumn": "nombre_columna_para_eje_y",
  "configuration": {
    "sort": {
      "by": "value", // "value" (por valor), "label" (alfabético), "none" (sin ordenar)
      "direction": "desc", // "asc" o "desc"
      "nullsPosition": "last" // Opcional: "first", "last"
    },
    "limit": {
      "enabled": true, // Si se debe limitar o no
      "count": 10, // Cuántos elementos mostrar
      "strategy": "top" // "top" (los X mayores), "bottom" (los X menores), "random" (aleatorio)
    },
    "filter": {
      "enabled": false, // Si se debe filtrar o no
      "rules": [
        // Se pueden añadir múltiples reglas si es necesario
        {
          "column": "nombre_columna",
          "operator": "greaterThan", // "greaterThan", "lessThan", "equals", "contains", "notEquals"
          "value": 100
        }
      ],
      "combineWith": "and" // "and", "or" - cómo combinar reglas múltiples
    },
    "style": {
      "colors": ["#4F46E5"], // Colores en hexadecimal
      "showGridLines": true,
      "showLegend": false
    }
  }
}

CSV:
${csv}
`.trim();
}

export function generateConclusionPrompt(csv: string, xCol: string, yCol: string): string {
	return `
Con base en los siguientes datos CSV, analiza la relación entre las columnas "${xCol}" y "${yCol}".
Proporciona una conclusión breve y clara en lenguaje natural, como si fueras un analista de datos.

Incluye en tu análisis:
1. Tendencias principales que se observan
2. Valores atípicos o datos interesantes
3. Posibles causas o correlaciones
4. Recomendaciones basadas en los datos (si aplica)

Tu conclusión debe ser concisa pero informativa, evitando jerga técnica innecesaria.

CSV:
${csv}
`.trim();
}

export function generateInsightsPrompt(csv: string, chartConfig: any): string {
	return `
Analiza los siguientes datos CSV y la configuración del gráfico generado.
Proporciona 3-5 insights clave que se pueden extraer de esta visualización.

Configuración del gráfico:
${JSON.stringify(chartConfig, null, 2)}

Para cada insight:
1. Describe claramente lo que muestran los datos
2. Explica por qué es importante o relevante
3. Sugiere posibles acciones o decisiones que podrían tomarse basadas en esto

Sé específico y usa números concretos de los datos cuando sea posible.

CSV:
${csv}
`.trim();
}
