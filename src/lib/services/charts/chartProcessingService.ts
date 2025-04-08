import type { ChartData } from '$lib/types/charts';
import * as Papa from 'papaparse';

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title: string;
  description?: string;
  xColumn: string;
  yColumn: string;
  configuration?: {
    sort?: {
      by?: 'value' | 'label' | 'none';
      direction?: 'asc' | 'desc';
    };
    limit?: {
      enabled?: boolean;
      count?: number;
      strategy?: 'top' | 'bottom' | 'random';
    };
    filter?: {
      enabled?: boolean;
      rules?: Array<{
        column: string;
        operator: string;
        value: any;
      }>;
      combineWith?: 'and' | 'or';
    };
    style?: {
      colors?: string[];
      showGridLines?: boolean;
      showLegend?: boolean;
    };
  };
}

/**
 * Procesa datos CSV para visualización
 */
export function processChartData(csvText: string, config: ChartConfig): ChartData {
  try {
    // Parse CSV
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    let data = result.data;
    
    // Filtrado
    if (config.configuration?.filter?.enabled && config.configuration.filter.rules?.length) {
      data = applyFilters(data, config.configuration.filter.rules, config.configuration.filter.combineWith);
    }
    
    // Preparar datos según tipo de gráfico
    let chartLabels = [];
    let chartValues = [];
    
    // Procesar según tipo de gráfico
    if (config.type === 'pie' || config.type === 'doughnut') {
      // Para gráficos circulares necesitamos agrupar datos
      const groupedData = groupAndAggregate(data, config.xColumn, config.yColumn);
      chartLabels = groupedData.map(item => String(item.group || ''));
      chartValues = groupedData.map(item => Number(item.value) || 0);
    } else {
      // Para gráficos de barras y líneas, extraer columnas directamente
      chartLabels = data.map(row => String(row[config.xColumn] || ''));
      chartValues = data.map(row => {
        const val = row[config.yColumn];
        return typeof val === 'number' ? val : parseFloat(String(val)) || 0;
      });
    }
    
    // Crear pares para ordenamiento/limitación
    let pairedData = chartLabels.map((label, i) => ({ label, value: chartValues[i] }));
    
    // Ordenar datos
    if (config.configuration?.sort?.by) {
      const direction = config.configuration.sort.direction === 'asc' ? 1 : -1;
      
      if (config.configuration.sort.by === 'value') {
        pairedData.sort((a, b) => (a.value - b.value) * direction);
      } else if (config.configuration.sort.by === 'label') {
        pairedData.sort((a, b) => String(a.label).localeCompare(String(b.label)) * direction);
      }
    }
    
    // Limitar datos si es necesario
    if (config.configuration?.limit?.enabled && config.configuration.limit.count) {
      const count = config.configuration.limit.count;
      
      if (config.configuration.limit.strategy === 'top') {
        pairedData.sort((a, b) => b.value - a.value);
        pairedData = pairedData.slice(0, count);
      } else if (config.configuration.limit.strategy === 'bottom') {
        pairedData.sort((a, b) => a.value - b.value);
        pairedData = pairedData.slice(0, count);
      } else {
        pairedData = pairedData.slice(0, count);
      }
    }
    
    // Reconstruir arrays desde pares
    chartLabels = pairedData.map(pair => pair.label);
    chartValues = pairedData.map(pair => pair.value);
    
    return {
      labels: chartLabels,
      values: chartValues,
      type: config.type,
      options: {
        xAxis: config.xColumn,
        yAxis: config.yColumn,
        title: config.title,
        color: config.configuration?.style?.colors?.[0]
      }
    };
  } catch (error) {
    console.error('Error procesando datos para gráfico:', error);
    return {
      labels: [],
      values: [],
      type: config.type,
      options: {
        xAxis: config.xColumn,
        yAxis: config.yColumn,
        title: 'Error al procesar datos',
        color: '#ff0000'
      }
    };
  }
}

/**
 * Agrupa y agrega datos para gráficos circulares
 */
function groupAndAggregate(data, groupCol, valueCol) {
  const groups = {};
  
  // Agrupar valores
  data.forEach(row => {
    const key = String(row[groupCol] || 'Otros');
    const value = row[valueCol];
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    
    if (!groups[key]) groups[key] = 0;
    groups[key] += numValue;
  });
  
  // Convertir a array de objetos
  return Object.entries(groups).map(([group, value]) => ({ group, value }));
}

/**
 * Aplica filtros a los datos
 */
function applyFilters(data, rules, combineWith = 'and') {
  return data.filter(row => {
    const results = rules.map(rule => {
      const value = row[rule.column];
      
      switch (rule.operator) {
        case 'greaterThan': return Number(value) > Number(rule.value);
        case 'lessThan': return Number(value) < Number(rule.value);
        case 'equals': return value == rule.value;
        case 'notEquals': return value != rule.value;
        case 'contains': return String(value).toLowerCase().includes(String(rule.value).toLowerCase());
        default: return true;
      }
    });
    
    return combineWith === 'and' ? results.every(r => r) : results.some(r => r);
  });
}

/**
 * Normaliza la configuración del gráfico
 */
export function normalizeChartConfig(config: Partial<ChartConfig>): ChartConfig {
  return {
    type: config.type || 'bar',
    title: config.title || 'Gráfico generado',
    description: config.description,
    xColumn: config.xColumn || '',
    yColumn: config.yColumn || '',
    configuration: {
      sort: {
        by: config.configuration?.sort?.by || 'none',
        direction: config.configuration?.sort?.direction || 'desc'
      },
      limit: {
        enabled: config.configuration?.limit?.enabled || false,
        count: config.configuration?.limit?.count || 10,
        strategy: config.configuration?.limit?.strategy || 'top'
      },
      filter: {
        enabled: config.configuration?.filter?.enabled || false,
        rules: config.configuration?.filter?.rules || [],
        combineWith: config.configuration?.filter?.combineWith || 'and'
      },
      style: {
        colors: config.configuration?.style?.colors || ['#4F46E5'],
        showGridLines: config.configuration?.style?.showGridLines !== undefined ? 
          config.configuration.style.showGridLines : true,
        showLegend: config.configuration?.style?.showLegend || false
      }
    }
  };
}
