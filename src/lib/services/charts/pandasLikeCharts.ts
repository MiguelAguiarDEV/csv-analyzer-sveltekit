import * as Papa from 'papaparse';

/**
 * Una interfaz simplificada estilo Pandas para configurar gráficos
 */

export interface ChartOptions {
  title?: string;
  xlabel?: string;
  ylabel?: string;
  kind?: 'bar' | 'line' | 'pie'; // Será expandible en el futuro
  color?: string;
  horizontal?: boolean;
  x?: string; // Columna para el eje X
  y?: string; // Columna para el eje Y
  sort_by?: 'x' | 'y' | null; // Columna para ordenar
  sort_ascending?: boolean; // Dirección de ordenamiento
  limit?: number; // Limitar número de elementos
  figsize?: [number, number]; // Tamaño [ancho, alto]
}

export interface ChartConfig {
  data: number[];
  labels: string[];
  title: string;
  xlabel: string;
  ylabel: string;
  color: string;
  horizontal: boolean;
}

/**
 * Procesa datos CSV y genera configuración para gráficos
 * @param csvText Texto del CSV
 * @param options Opciones de configuración estilo pandas
 */
export function generateChart(csvText: string, options: ChartOptions): ChartConfig {
  console.log('pandasLikeCharts - Generando gráfico con opciones:', options);
  
  // Parsear CSV
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });
  
  console.log('pandasLikeCharts - CSV parseado, filas:', parseResult.data.length);
  
  const data = parseResult.data as Record<string, any>[];
  if (!data.length) {
    console.error('pandasLikeCharts - CSV sin datos');
    return createEmptyConfig();
  }
  
  // Verificar que las columnas existen
  const headers = parseResult.meta.fields || [];
  console.log('pandasLikeCharts - Columnas detectadas:', headers);
  
  const xColumn = options.x || headers[0];
  const yColumn = options.y || (headers.length > 1 ? headers[1] : headers[0]);
  
  if (!headers.includes(xColumn) || !headers.includes(yColumn)) {
    console.error(`pandasLikeCharts - Columnas no encontradas: x=${xColumn}, y=${yColumn}`);
    return createEmptyConfig();
  }
  
  // Extraer y preparar los datos
  let chartData = [...data];
  
  // Ordenar si es necesario
  if (options.sort_by) {
    const sortCol = options.sort_by === 'x' ? xColumn : yColumn;
    const direction = options.sort_ascending ? 1 : -1;
    
    chartData.sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * direction;
      }
      
      return String(aVal).localeCompare(String(bVal)) * direction;
    });
    
    console.log(`pandasLikeCharts - Datos ordenados por ${sortCol}, dirección:`, options.sort_ascending ? 'ascendente' : 'descendente');
  }
  
  // Limitar si es necesario
  if (options.limit && options.limit > 0 && options.limit < chartData.length) {
    chartData = chartData.slice(0, options.limit);
    console.log(`pandasLikeCharts - Datos limitados a ${options.limit} elementos`);
  }
  
  // Extraer labels y valores
  const labels = chartData.map(row => String(row[xColumn] || ''));
  const values = chartData.map(row => {
    const val = row[yColumn];
    return typeof val === 'number' ? val : parseFloat(String(val)) || 0;
  });
  
  console.log('pandasLikeCharts - Labels generados:', labels.slice(0, 5), '...');
  console.log('pandasLikeCharts - Valores generados:', values.slice(0, 5), '...');
  
  // Configuración del gráfico
  return {
    data: values,
    labels: labels,
    title: options.title || `${yColumn} por ${xColumn}`,
    xlabel: options.xlabel || xColumn,
    ylabel: options.ylabel || yColumn,
    color: options.color || '#4F46E5',
    horizontal: options.horizontal || false
  };
}

/**
 * Genera un JSON de prompt para que la IA genere configuraciones de gráficos
 * @param columns Columnas disponibles en el CSV
 */
export function generateAIPromptTemplate(columns: string[]): string {
  return `
Analiza los datos CSV y genera una configuración para visualizarlos.
Las columnas disponibles son: ${columns.join(', ')}

Devuelve un JSON siguiendo exactamente este formato:
{
  "x": "nombre_columna_para_eje_x",
  "y": "nombre_columna_para_eje_y",
  "title": "Título del gráfico",
  "xlabel": "Etiqueta para eje X",
  "ylabel": "Etiqueta para eje Y",
  "kind": "bar",
  "color": "#4F46E5",
  "horizontal": false,
  "sort_by": "y",
  "sort_ascending": false,
  "limit": 10
}

Donde:
- x: Columna a usar en el eje X (categorías)
- y: Columna a usar en el eje Y (valores numéricos)
- title: Título descriptivo del gráfico
- xlabel/ylabel: Etiquetas para los ejes
- kind: Tipo de gráfico ("bar" por ahora)
- color: Color en formato hexadecimal
- horizontal: Si las barras deben ser horizontales
- sort_by: Columna para ordenar ("x", "y" o null)
- sort_ascending: true para orden ascendente, false para descendente
- limit: Número máximo de elementos a mostrar (para legibilidad)

Selecciona las columnas x e y apropiadas (normalmente x es categórica y y es numérica).
`;
}

/**
 * Configuración vacía para casos de error
 */
function createEmptyConfig(): ChartConfig {
  return {
    data: [],
    labels: [],
    title: 'Sin datos disponibles',
    xlabel: 'X',
    ylabel: 'Y',
    color: '#cccccc',
    horizontal: false
  };
}
