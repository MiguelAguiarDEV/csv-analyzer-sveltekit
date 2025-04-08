import * as Papa from 'papaparse';

/**
 * Analiza un archivo CSV y extrae los datos para un gráfico básico
 */
export function analyzeCSV(csvText: string) {
  console.log("[SimpleCsvService] Analizando CSV...");
  
  try {
    // Sanitizar el texto del CSV
    csvText = csvText.trim();
    
    // Parsear el CSV con PapaParse
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true // Convierte automáticamente los valores a números cuando es posible
    });
    
    console.log("[SimpleCsvService] CSV parseado:", {
      columnNames: parseResult.meta.fields,
      rowCount: parseResult.data.length,
      errors: parseResult.errors.length > 0 ? parseResult.errors : "Ninguno"
    });
    
    // Si hay errores, mostrarlos
    if (parseResult.errors.length > 0) {
      console.warn("[SimpleCsvService] Errores al parsear CSV:", parseResult.errors);
    }
    
    // Obtener las columnas y los datos
    const columns = parseResult.meta.fields || [];
    const data = parseResult.data as Record<string, any>[];
    
    // Análisis básico de columnas para saber cuáles son numéricas
    const columnAnalysis = analyzeColumns(data, columns);
    console.log("[SimpleCsvService] Análisis de columnas:", columnAnalysis);
    
    return {
      columns,
      data,
      columnAnalysis,
      rowCount: data.length
    };
  } catch (error) {
    console.error("[SimpleCsvService] Error al analizar CSV:", error);
    throw new Error("No se pudo analizar el archivo CSV");
  }
}

/**
 * Analiza las columnas para determinar sus tipos y estadísticas básicas
 */
function analyzeColumns(data: Record<string, any>[], columns: string[]) {
  const analysis = {};
  
  columns.forEach(column => {
    // Obtener todos los valores no vacíos de la columna
    const values = data
      .map(row => row[column])
      .filter(val => val !== null && val !== undefined && val !== "");
    
    // Determinar si es una columna numérica
    const numericValues = values.filter(val => typeof val === "number");
    const isNumeric = numericValues.length > 0 && (numericValues.length / values.length) > 0.5;
    
    // Calcular estadísticas básicas si es numérica
    let stats = { min: null, max: null, avg: null };
    
    if (isNumeric && numericValues.length > 0) {
      stats.min = Math.min(...numericValues);
      stats.max = Math.max(...numericValues);
      stats.avg = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    }
    
    // Contar valores únicos
    const uniqueValues = new Set(values);
    
    analysis[column] = {
      type: isNumeric ? "numeric" : "categorical",
      uniqueValueCount: uniqueValues.size,
      nonEmptyCount: values.length,
      emptyCount: data.length - values.length,
      isNumeric,
      stats,
      // Para columnas categóricas, contar las frecuencias de los valores más comunes
      topValues: isNumeric ? [] : getTopValues(values, 5)
    };
  });
  
  return analysis;
}

/**
 * Obtiene los valores más frecuentes en una columna
 */
function getTopValues(values: any[], limit: number) {
  const counts = {};
  
  values.forEach(value => {
    counts[value] = (counts[value] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

/**
 * Extrae datos para un gráfico de barras básico
 */
export function extractBarChartData(data: Record<string, any>[], xColumn: string, yColumn: string) {
  console.log(`[SimpleCsvService] Extrayendo datos para gráfico: X=${xColumn}, Y=${yColumn}`);
  
  try {
    if (!data || !data.length) {
      console.warn("[SimpleCsvService] No hay datos para extraer");
      return { xData: [], yData: [] };
    }
    
    // Extraer los valores para los ejes X e Y
    const xData = data.map(row => String(row[xColumn] || ""));
    
    // Para el eje Y, convertir a números
    const yData = data.map(row => {
      const value = row[yColumn];
      if (typeof value === "number") return value;
      const parsedValue = parseFloat(String(value));
      return isNaN(parsedValue) ? 0 : parsedValue;
    });
    
    console.log("[SimpleCsvService] Datos extraídos:", {
      xDataLength: xData.length,
      yDataLength: yData.length,
      xDataSample: xData.slice(0, 3),
      yDataSample: yData.slice(0, 3)
    });
    
    return { xData, yData };
  } catch (error) {
    console.error("[SimpleCsvService] Error al extraer datos:", error);
    return { xData: [], yData: [] };
  }
}
