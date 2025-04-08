import * as Papa from 'papaparse';

// Interfaces básicas para la configuración
export interface BarChartConfig {
  // Propiedades principales (estilo pandas)
  x_column: string;       // Nombre de columna para etiquetas (eje X)
  y_column: string;       // Nombre de columna para valores (eje Y)
  title?: string;         // Título del gráfico
  xlabel?: string;        // Etiqueta eje X
  ylabel?: string;        // Etiqueta eje Y
  figsize?: [number, number]; // Tamaño [ancho, alto]
  color?: string;         // Color principal
  horizontal?: boolean;   // Orientación
  
  // Propiedades de procesamiento
  sort_by?: 'value' | 'label' | 'none'; // Ordenamiento
  sort_ascending?: boolean; // Dirección ordenamiento
  limit?: number;        // Limitar a N elementos
  filter?: {            // Filtrado opcional
    column: string;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains';
    value: any;
  }[];
}

// Prompt para la IA
const barChartPrompt = `
Analiza el siguiente CSV y genera una configuración para un gráfico de barras.
Basándote en los datos, selecciona las columnas más adecuadas para visualizar.

Tu respuesta debe ser un objeto JSON con esta estructura:
{
  "x_column": "nombre_columna_para_eje_x",
  "y_column": "nombre_columna_para_eje_y",
  "title": "Título descriptivo para el gráfico",
  "xlabel": "Etiqueta para eje X",
  "ylabel": "Etiqueta para eje Y",
  "figsize": [800, 400],
  "color": "#hex_color",
  "horizontal": false,
  "sort_by": "value", // "value", "label" o "none"
  "sort_ascending": false,
  "limit": 10, // Limitar a los 10 elementos más relevantes
  "filter": [] // Opcional, filtros a aplicar
}

Selecciona columnas que tengan una relación interesante. Si hay muchas categorías,
considera limitarlas a 10-15 y usar orientación horizontal (horizontal: true).
Para el eje Y selecciona una columna numérica. Para el eje X una columna categórica.

CSV:
`;

/**
 * Solicita a la IA una configuración para gráfico de barras
 */
export async function getBarChartConfigFromAI(csvText: string): Promise<BarChartConfig> {
  try {
    console.log('chartConfigService: Solicitando configuración a la IA');
    
    // Validar CSV rápidamente
    const preview = Papa.parse(csvText, { preview: 5 });
    console.log('chartConfigService: Preview CSV', preview);
    if (preview.errors.length > 0) {
      console.warn('chartConfigService: Errores en CSV', preview.errors);
    }
    
    // Construir prompt con los datos
    const prompt = barChartPrompt + csvText;
    console.log('chartConfigService: Enviando prompt a la IA (Longitud: ' + prompt.length + ')');
    
    // Solicitar configuración
    const response = await fetch('/api/geminai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      console.error('chartConfigService: Error en respuesta API', response.status);
      throw new Error('Error en la comunicación con la API de IA');
    }
    
    const result = await response.json();
    console.log('chartConfigService: Respuesta completa de la IA', result);
    
    // Extraer y parsear JSON de la respuesta
    const contentText = result.content || '';
    console.log('chartConfigService: Contenido recibido', contentText);
    
    // Buscar JSON en el texto
    const jsonMatch = contentText.match(/```json\n?([\s\S]*?)```/) || 
                      contentText.match(/```([\s\S]*?)```/) ||
                      [null, contentText];
    
    const jsonText = jsonMatch[1]?.trim() || contentText.trim();
    console.log('chartConfigService: JSON extraído', jsonText);
    
    // Intentar parsear JSON
    try {
      const parsedConfig = JSON.parse(jsonText);
      console.log('chartConfigService: Configuración parseada', parsedConfig);
      
      // Normalizar configuración
      return normalizeBarChartConfig(parsedConfig);
    } catch (parseError) {
      console.error('chartConfigService: Error parseando JSON', parseError);
      console.log('Texto que falló al parsear:', jsonText);
      throw new Error('La respuesta de la IA no contiene JSON válido');
    }
  } catch (error) {
    console.error('chartConfigService: Error general', error);
    throw error;
  }
}

/**
 * Normaliza la configuración con valores por defecto
 */
export function normalizeBarChartConfig(config: Partial<BarChartConfig>): BarChartConfig {
  console.log('chartConfigService: Normalizando configuración', config);
  
  // Configuración normalizada
  const normalizedConfig: BarChartConfig = {
    x_column: config.x_column || '',
    y_column: config.y_column || '',
    title: config.title || 'Visualización de datos',
    xlabel: config.xlabel || config.x_column || '',
    ylabel: config.ylabel || config.y_column || '',
    figsize: config.figsize || [800, 400],
    color: config.color || '#4F46E5',
    horizontal: config.horizontal || false,
    sort_by: config.sort_by || 'none',
    sort_ascending: config.sort_ascending || false,
    limit: config.limit || 0,
    filter: config.filter || []
  };
  
  console.log('chartConfigService: Configuración normalizada', normalizedConfig);
  return normalizedConfig;
}

/**
 * Procesa los datos según la configuración
 */
export function processDataForBarChart(csvData: any[], config: BarChartConfig): { 
  labels: any[], 
  data: number[] 
} {
  console.log('chartConfigService: Procesando datos según configuración', { config, dataLength: csvData.length });
  
  // Validar
  if (!csvData || !csvData.length) {
    console.warn('chartConfigService: No hay datos para procesar');
    return { labels: [], data: [] };
  }
  
  if (!config.x_column || !config.y_column) {
    console.warn('chartConfigService: Configuración incompleta, faltan columnas X o Y');
    return { labels: [], data: [] };
  }
  
  try {
    // Filtrar datos si hay filtros
    let filteredData = [...csvData];
    if (config.filter && config.filter.length) {
      console.log('chartConfigService: Aplicando filtros', config.filter);
      
      filteredData = filteredData.filter(row => {
        return config.filter.every(filter => {
          const value = row[filter.column];
          const filterValue = filter.value;
          
          switch (filter.operator) {
            case 'gt': return Number(value) > Number(filterValue);
            case 'lt': return Number(value) < Number(filterValue);
            case 'eq': return value == filterValue;
            case 'ne': return value != filterValue;
            case 'contains': return String(value).includes(String(filterValue));
            default: return true;
          }
        });
      });
      
      console.log('chartConfigService: Datos filtrados', { 
        original: csvData.length, 
        filtrado: filteredData.length 
      });
    }
    
    // Extraer columnas
    let result = filteredData.map(row => ({
      label: row[config.x_column],
      value: typeof row[config.y_column] === 'number' 
        ? row[config.y_column] 
        : parseFloat(row[config.y_column]) || 0
    }));
    
    // Agrupar por etiqueta (sumando valores)
    const grouped = {};
    result.forEach(({ label, value }) => {
      const key = String(label || 'Indefinido');
      grouped[key] = (grouped[key] || 0) + value;
    });
    
    // Convertir a arrays
    result = Object.entries(grouped).map(([label, value]) => ({ label, value }));
    
    // Ordenar
    if (config.sort_by && config.sort_by !== 'none') {
      console.log('chartConfigService: Ordenando por', config.sort_by, config.sort_ascending ? 'ascendente' : 'descendente');
      
      const direction = config.sort_ascending ? 1 : -1;
      
      if (config.sort_by === 'value') {
        result.sort((a, b) => (a.value - b.value) * direction);
      } else if (config.sort_by === 'label') {
        result.sort((a, b) => String(a.label).localeCompare(String(b.label)) * direction);
      }
    }
    
    // Limitar si es necesario
    if (config.limit && config.limit > 0 && config.limit < result.length) {
      console.log('chartConfigService: Limitando a', config.limit, 'elementos');
      result = result.slice(0, config.limit);
    }
    
    // Extraer arrays finales
    const labels = result.map(item => item.label);
    const data = result.map(item => item.value);
    
    console.log('chartConfigService: Datos procesados', { labels, data });
    return { labels, data };
  } catch (error) {
    console.error('chartConfigService: Error procesando datos', error);
    return { labels: [], data: [] };
  }
}
