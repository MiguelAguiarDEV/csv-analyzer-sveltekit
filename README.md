# CSV Analyzer con SvelteKit

Aplicación web para análisis y visualización de archivos CSV con generación inteligente de gráficos mediante IA.

## Características

- Carga y previsualización de archivos CSV
- Detección automática de tipos de datos
- Generación de visualizaciones (gráficos de barras, líneas y pastel)
- Análisis automático con IA (usando Gemini)
- Insights y conclusiones generadas por IA

## Estructura del Proyecto

```
csv-analyzer-sveltekit/
├── src/
│   ├── lib/
│   │   ├── components/           # Componentes UI
│   │   │   ├── csv/              # Componentes para CSV
│   │   │   │   ├── CsvPreview.svelte
│   │   │   │   └── FileUploader.svelte
│   │   │   ├── charts/           # Componentes de gráficos
│   │   │   │   ├── ChartSelector.svelte
│   │   │   │   ├── BarChart.svelte
│   │   │   │   ├── types/
│   │   │   │   │   ├── BarChart.svelte
│   │   │   │   │   ├── LineChart.svelte
│   │   │   │   │   └── PieChart.svelte
│   │   │   │   └── config/
│   │   │   │       ├── BarChartConfig.svelte
│   │   │   │       └── details/
│   │   │   │           └── ChartConfigDetails.svelte
│   │   │   ├── ui/               # Componentes genéricos
│   │   │   │   └── LoadingButton.svelte
│   │   │   └── results/          # Componentes de resultados
│   │   │       └── ResultOutput.svelte
│   │   ├── services/             # Lógica de negocio
│   │   │   ├── csv/              # Servicios para CSV
│   │   │   │   └── csvService.ts
│   │   │   ├── charts/           # Servicios para gráficos
│   │   │   │   ├── chartService.ts
│   │   │   │   └── chartProcessingService.ts
│   │   │   └── ai/               # Servicios de IA
│   │   │       └── geminaiService.ts
│   │   ├── config/               # Configuraciones
│   │   │   ├── app.config.ts
│   │   │   ├── chart.config.ts
│   │   │   └── ai.config.ts
│   │   ├── prompts/              # Plantillas para IA
│   │   │   └── prompts.ts
│   │   └── types/                # Definición de tipos
│   │       ├── ai/
│   │       │   └── geminai.d.ts
│   │       ├── charts.d.ts
│   │       ├── csv.d.ts
│   │       └── ui.d.ts
│   ├── routes/                   # Rutas de la aplicación
│   │   ├── +layout.svelte        # Layout principal
│   │   ├── +page.svelte          # Dashboard principal
│   │   ├── analyze/              # Análisis manual
│   │   │   └── +page.svelte
│   │   ├── autogen/              # Análisis con IA
│   │   │   └── +page.svelte
│   │   └── api/                  # Endpoints API
│   │       └── geminai/
│   │           └── +server.ts
│   ├── app.css                   # Estilos globales
│   ├── app.d.ts                  # Tipos globales
│   └── app.html                  # Plantilla HTML
```

## Flujos de trabajo

### 1. Análisis Manual

1. Usuario carga CSV → `FileUploader`
2. Datos procesados por → `csvService`
3. Previsualización en → `CsvPreview`
4. Usuario configura gráfico en → `BarChartConfig`
5. Visualización generada por → `BarChart`

### 2. Análisis con IA

1. Usuario carga CSV → `FileUploader`
2. Datos enviados a Gemini vía → `generateAdvancedChartPrompt`
3. IA genera configuración óptima
4. Datos procesados por → `chartProcessingService`
5. Visualización generada por → `ChartSelector`
6. IA genera insights y conclusiones

## Capacidades IA

El sistema permite a la IA:

- Seleccionar el tipo de gráfico más adecuado
- Filtrar datos relevantes
- Ordenar y limitar visualizaciones
- Aplicar estilos y colores óptimos
- Generar insights basados en patrones detectados

## Tecnologías

- SvelteKit
- TypeScript
- Chart.js
- PapaParse (CSV parsing)
- TailwindCSS
- Gemini AI API

## Desarrollo

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Añadir tus claves API de Gemini

# Desarrollo
npm run dev

# Compilación
npm run build
```
