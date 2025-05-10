export interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

export interface JsonNode {
  key: string
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  children?: JsonNode[]
  path: string
}

export interface QueryHistory {
  query: string
  timestamp: number
  resultCount: number
}

export interface QueryResult {
  path: string
  value: any
  type: string
}

export interface ConversionOptions {
  xml: {
    pretty: boolean
    indent: string
    header: boolean
  }
  csv: {
    delimiter: string
    header: boolean
    flatten: boolean
  }
}

export interface ChartData {
  name: string
  value: number
  color?: string
  [key: string]: any  // 支持多系列数据的动态属性
}

export interface VisualizationOptions {
  chartType: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'stackedBar' | 'scatter' | 'radar' | 'treemap'
  xField: string
  yField: string
  colorField: string
} 