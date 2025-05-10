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
}

export interface VisualizationOptions {
  chartType: 'bar' | 'line' | 'pie'
  xField: string
  yField: string
  colorField: string
} 