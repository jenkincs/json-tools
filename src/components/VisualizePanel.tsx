import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  SelectChangeEvent,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutChartIcon,
  StackedBarChart as StackedBarChartIcon,
  BubbleChart as ScatterChartIcon,
  ExpandMore,
  ShowChart
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap
} from 'recharts'
import { ChartData, VisualizationOptions } from '../types'
import { flattenObject, processData } from '../utils/jsonUtils'

interface VisualizePanelProps {
  onSnackbar: (message: string) => void
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#a4de6c', '#d0ed57', '#ffc658']

// 示例数据
const EXAMPLE_DATA = [
  {
    name: 'Example 1 - Simple Data',
    data: JSON.stringify([
      { "Month": "January", "Sales": 1200, "Cost": 800, "Profit": 400, "Category": "Electronics" },
      { "Month": "February", "Sales": 1900, "Cost": 1200, "Profit": 700, "Category": "Electronics" },
      { "Month": "March", "Sales": 1500, "Cost": 900, "Profit": 600, "Category": "Electronics" },
      { "Month": "April", "Sales": 2200, "Cost": 1400, "Profit": 800, "Category": "Electronics" },
      { "Month": "May", "Sales": 2800, "Cost": 1800, "Profit": 1000, "Category": "Electronics" }
    ], null, 2)
  },
  {
    name: 'Example 2 - Multi-series Data',
    data: JSON.stringify([
      { "Region": "North", "Electronics": 4200, "Clothing": 2800, "Food": 3500 },
      { "Region": "East", "Electronics": 5500, "Clothing": 3100, "Food": 4100 },
      { "Region": "South", "Electronics": 6100, "Clothing": 4200, "Food": 3800 },
      { "Region": "West", "Electronics": 3800, "Clothing": 2600, "Food": 2900 }
    ], null, 2)
  },
  {
    name: 'Example 3 - Nested Data',
    data: JSON.stringify({
      "SalesData": {
        "2023": {
          "Q1": { "Product A": 5200, "Product B": 3800, "Product C": 4100 },
          "Q2": { "Product A": 6100, "Product B": 4200, "Product C": 4500 },
          "Q3": { "Product A": 5800, "Product B": 4500, "Product C": 4200 },
          "Q4": { "Product A": 7200, "Product B": 5100, "Product C": 5800 }
        }
      }
    }, null, 2)
  }
]

export function VisualizePanel({ onSnackbar }: VisualizePanelProps) {
  const [input, setInput] = useState('')
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [availableFields, setAvailableFields] = useState<string[]>([])
  const [visualizationError, setVisualizationError] = useState<string | null>(null)
  const [visualizationOptions, setVisualizationOptions] = useState<VisualizationOptions>({
    chartType: 'bar',
    xField: '',
    yField: '',
    colorField: ''
  })
  const [dataExample, setDataExample] = useState<boolean>(false)
  const [multiSeriesMode, setMultiSeriesMode] = useState<boolean>(false)
  const [seriesFields, setSeriesFields] = useState<string[]>([])

  // 当输入JSON改变时更新可用字段
  useEffect(() => {
    try {
      if (!input.trim()) return
      
      const jsonData = JSON.parse(input)
      
      // 获取有效的字段名
      let fields: string[] = []
      
      if (Array.isArray(jsonData)) {
        // 如果是数组，获取第一个对象的所有键作为字段
        if (jsonData.length > 0 && typeof jsonData[0] === 'object' && jsonData[0] !== null) {
          fields = Object.keys(jsonData[0])
          
          // 确保所有数组元素都具有相同的字段
          jsonData.forEach(item => {
            if (typeof item === 'object' && item !== null) {
              // 只保留所有对象中都存在的字段
              fields = fields.filter(field => field in item)
            }
          })
        }
      } else if (typeof jsonData === 'object' && jsonData !== null) {
        // 如果是单个对象，获取顶层键
        fields = Object.keys(jsonData)
      }
      
      setAvailableFields(fields)
      setVisualizationError(null)
    } catch (err) {
      // 忽略解析错误
    }
  }, [input])

  // 更新多系列数据选择
  useEffect(() => {
    // 当切换多系列模式时，清空之前选择的系列字段
    if (!multiSeriesMode) {
      setSeriesFields([])
    } else if (multiSeriesMode && availableFields.length > 0) {
      // 自动选择所有可能是数值的字段（除了X轴字段）
      const potentialValueFields = availableFields.filter(field => field !== visualizationOptions.xField)
      
      // 尝试检查字段类型，如果是JSON数组
      try {
        const jsonData = JSON.parse(input)
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          // 只选择数值类型的字段
          const numericFields = potentialValueFields.filter(field => {
            const value = jsonData[0][field]
            return typeof value === 'number' || (!isNaN(Number(value)) && value !== '')
          })
          
          // 最多选择前5个数值字段作为系列
          setSeriesFields(numericFields.slice(0, 5))
          return
        }
      } catch (err) {
        // 忽略错误
      }
      
      // 如果无法确定，则最多选择前5个字段
      setSeriesFields(potentialValueFields.slice(0, 5))
    }
  }, [multiSeriesMode, visualizationOptions.xField, availableFields, input])

  const handleVisualize = () => {
    try {
      if (!input.trim()) {
        setVisualizationError('Please enter JSON data')
        return
      }

      const jsonData = JSON.parse(input)
      
      if (!visualizationOptions.xField || (!visualizationOptions.yField && !multiSeriesMode)) {
        setVisualizationError('Please select X and Y fields')
        return
      }
      
      if (multiSeriesMode && seriesFields.length === 0) {
        setVisualizationError('Please select at least one data series')
        return
      }

      let chartData: ChartData[] = []
      
      // 处理数组类型数据
      if (Array.isArray(jsonData)) {
        if (multiSeriesMode && seriesFields.length > 0) {
          // 多系列数据处理
          chartData = jsonData.map((item, index) => {
            const baseObj: any = {
              name: item[visualizationOptions.xField]?.toString() || `Item ${index + 1}`
            }
            
            // 特别处理堆叠柱状图的数据 - 确保所有系列都有值
            if (visualizationOptions.chartType === 'stackedBar') {
              seriesFields.forEach(field => {
                // 确保值为数字，即使原始数据为null或undefined也设为0
                const rawValue = item[field]
                baseObj[field] = typeof rawValue === 'number' ? rawValue : 
                               (rawValue && !isNaN(Number(rawValue)) ? Number(rawValue) : 0)
              })
            } else {
              // 其他图表类型的处理
              seriesFields.forEach(field => {
                const rawValue = item[field]
                baseObj[field] = typeof rawValue === 'number' ? rawValue : 
                               (rawValue && !isNaN(Number(rawValue)) ? Number(rawValue) : 0)
              })
            }
            
            return baseObj
          })
        } else {
          // 单系列数据处理
          chartData = jsonData.map((item, index) => ({
            name: item[visualizationOptions.xField]?.toString() || `Item ${index + 1}`,
            value: typeof item[visualizationOptions.yField] === 'number' ? 
                   item[visualizationOptions.yField] : 
                   Number(item[visualizationOptions.yField]) || 0,
            color: item[visualizationOptions.colorField]?.toString() || COLORS[index % COLORS.length]
          }))
        }
      } 
      // 处理对象类型数据
      else if (typeof jsonData === 'object' && jsonData !== null) {
        // 将对象转换为键值对数组
        const entries = Object.entries(jsonData).map(([key, value]) => ({
          key,
          value: typeof value === 'number' ? value : (typeof value === 'object' ? 0 : Number(value) || 0)
        }))
        
        chartData = entries.map((item, index) => ({
          name: item.key,
          value: item.value,
          color: COLORS[index % COLORS.length]
        }))
      }
      
      // 确保生成的数据至少有一个项
      if (chartData.length === 0) {
        setVisualizationError('No valid data points to visualize')
        return
      }
      
      setChartData(chartData)
      setVisualizationError(null)
      onSnackbar('Chart updated')
    } catch (err) {
      console.error(err)
      setVisualizationError('Invalid JSON format')
      setChartData([])
    }
  }

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    const newChartType = event.target.value as any
    
    // 当选择堆叠柱状图时，自动切换到多系列模式
    if (newChartType === 'stackedBar' && !multiSeriesMode) {
      setMultiSeriesMode(true)
    }
    
    setVisualizationOptions(prev => ({
      ...prev,
      chartType: newChartType
    }))
  }

  const handleFieldChange = (field: 'xField' | 'yField' | 'colorField', value: string) => {
    setVisualizationOptions(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch (err) {
      setVisualizationError('Failed to read from clipboard')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input)
      onSnackbar('Copied to clipboard')
    } catch (err) {
      setVisualizationError('Failed to copy to clipboard')
    }
  }

  const loadExampleData = (exampleData: string) => {
    setInput(exampleData)
    setDataExample(false)
  }

  const toggleSeriesField = (field: string) => {
    if (seriesFields.includes(field)) {
      setSeriesFields(seriesFields.filter(f => f !== field))
    } else {
      setSeriesFields([...seriesFields, field])
    }
  }

  const renderChart = () => {
    if (!chartData.length) return null

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (visualizationOptions.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {multiSeriesMode && seriesFields.length > 0 ? (
                seriesFields.map((field, index) => (
                  <Bar key={field} dataKey={field} fill={COLORS[index % COLORS.length]} />
                ))
              ) : (
                <Bar dataKey="value" fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        )
      case 'stackedBar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {multiSeriesMode && seriesFields.length > 1 ? (
                seriesFields.map((field, index) => (
                  <Bar 
                    key={field} 
                    dataKey={field} 
                    stackId="a" 
                    fill={COLORS[index % COLORS.length]} 
                    name={field}
                  />
                ))
              ) : (
                <Bar 
                  dataKey={multiSeriesMode && seriesFields.length === 1 ? seriesFields[0] : "value"} 
                  fill="#8884d8" 
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {multiSeriesMode && seriesFields.length > 0 ? (
                seriesFields.map((field, index) => (
                  <Line key={field} type="monotone" dataKey={field} stroke={COLORS[index % COLORS.length]} />
                ))
              ) : (
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              )}
            </LineChart>
          </ResponsiveContainer>
        )
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {multiSeriesMode && seriesFields.length > 0 ? (
                seriesFields.map((field, index) => (
                  <Area key={field} type="monotone" dataKey={field} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                ))
              ) : (
                <Area type="monotone" dataKey="value" fill="#8884d8" stroke="#8884d8" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={150}
                fill="#8884d8"
                dataKey={multiSeriesMode ? seriesFields[0] : "value"}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                innerRadius={60}
                outerRadius={150}
                fill="#8884d8"
                dataKey={multiSeriesMode ? seriesFields[0] : "value"}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey={multiSeriesMode ? seriesFields[0] : "value"} name="X Axis" />
              <YAxis type="number" dataKey={multiSeriesMode ? seriesFields[1] : "value"} name="Y Axis" />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Data Points" data={chartData} fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius={150} data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              {multiSeriesMode && seriesFields.length > 0 ? (
                seriesFields.map((field, index) => (
                  <Radar
                    key={field}
                    name={field}
                    dataKey={field}
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))
              ) : (
                <Radar
                  name="Value"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              )}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )
      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={chartData}
              dataKey={multiSeriesMode ? seriesFields[0] : "value"}
              ratio={4/3}
              stroke="#fff"
              fill="#8884d8"
              content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: chartData[index]?.color || COLORS[index % COLORS.length],
                        stroke: '#fff',
                        strokeWidth: 2 / (depth + 1e-10),
                        strokeOpacity: 1 / (depth + 1e-10),
                      }}
                    />
                    {depth === 1 && (
                      <text
                        x={x + width / 2}
                        y={y + height / 2 + 7}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={14}
                      >
                        {chartData[index]?.name}
                      </text>
                    )}
                  </g>
                );
              }}
            />
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  // 检查字段是否为数值型
  const isNumericField = (field: string): boolean => {
    try {
      const jsonData = JSON.parse(input)
      
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        const value = jsonData[0][field]
        return typeof value === 'number' || (!isNaN(Number(value)) && value !== '')
      }
      
      if (typeof jsonData === 'object' && jsonData !== null) {
        const value = jsonData[field]
        return typeof value === 'number' || (!isNaN(Number(value)) && value !== '')
      }
    } catch (err) {
      // 忽略错误
    }
    
    return false
  }
  
  // 检查字段是否为类别型（字符串）
  const isCategoryField = (field: string): boolean => {
    try {
      const jsonData = JSON.parse(input)
      
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        const value = jsonData[0][field]
        return typeof value === 'string'
      }
      
      if (typeof jsonData === 'object' && jsonData !== null) {
        const value = jsonData[field]
        return typeof value === 'string'
      }
    } catch (err) {
      // 忽略错误
    }
    
    return false
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Data Visualization
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">JSON Data</Typography>
                <Box>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => setDataExample(true)}
                    sx={{ mr: 1 }}
                  >
                    Load Examples
                  </Button>
                  <Tooltip title="Paste">
                    <IconButton onClick={handlePaste} size="small">
                      <ContentPaste />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy">
                    <IconButton onClick={handleCopy} size="small">
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={10}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter JSON data here..."
                error={!!visualizationError}
                helperText={visualizationError}
              />
              
              {dataExample && (
                <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>Example Data:</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {EXAMPLE_DATA.map((example, index) => (
                      <Button 
                        key={index}
                        size="small"
                        variant="outlined"
                        onClick={() => loadExampleData(example.data)}
                      >
                        {example.name}
                      </Button>
                    ))}
                  </Box>
                </Paper>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1">Chart Configuration</Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={visualizationOptions.chartType}
                    label="Chart Type"
                    onChange={handleChartTypeChange}
                  >
                    <MenuItem value="bar">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BarChartIcon /> Bar Chart
                      </Box>
                    </MenuItem>
                    <MenuItem value="stackedBar">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StackedBarChartIcon /> Stacked Bar 
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (requires multi-series)
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="line">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LineChartIcon /> Line Chart
                      </Box>
                    </MenuItem>
                    <MenuItem value="area">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShowChart /> Area Chart
                      </Box>
                    </MenuItem>
                    <MenuItem value="pie">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PieChartIcon /> Pie Chart
                      </Box>
                    </MenuItem>
                    <MenuItem value="donut">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DonutChartIcon /> Donut Chart
                      </Box>
                    </MenuItem>
                    <MenuItem value="scatter">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScatterChartIcon /> Scatter Plot
                      </Box>
                    </MenuItem>
                    <MenuItem value="radar">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DonutChartIcon /> Radar Chart
                      </Box>
                    </MenuItem>
                    <MenuItem value="treemap">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BarChartIcon /> Treemap
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>X-Axis Field</InputLabel>
                  <Select
                    value={visualizationOptions.xField}
                    label="X-Axis Field"
                    onChange={(e) => handleFieldChange('xField', e.target.value)}
                  >
                    {availableFields.map((field) => (
                      <MenuItem key={field} value={field}>
                        {field} {isCategoryField(field) && <small style={{ color: 'gray' }}>(category)</small>}
                        {isNumericField(field) && <small style={{ color: 'gray' }}>(numeric)</small>}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {!multiSeriesMode && (
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Y-Axis Field</InputLabel>
                    <Select
                      value={visualizationOptions.yField}
                      label="Y-Axis Field"
                      onChange={(e) => handleFieldChange('yField', e.target.value)}
                    >
                      {availableFields
                        .filter(field => isNumericField(field))
                        .map((field) => (
                          <MenuItem key={field} value={field}>
                            {field} <small style={{ color: 'gray' }}>(numeric)</small>
                          </MenuItem>
                        ))}
                      {availableFields
                        .filter(field => !isNumericField(field))
                        .map((field) => (
                          <MenuItem key={field} value={field}>
                            {field}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}
                
                {!multiSeriesMode && (
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Color Field</InputLabel>
                    <Select
                      value={visualizationOptions.colorField}
                      label="Color Field"
                      onChange={(e) => handleFieldChange('colorField', e.target.value)}
                    >
                      <MenuItem value="">None</MenuItem>
                      {availableFields
                        .filter(field => isCategoryField(field))
                        .map((field) => (
                          <MenuItem key={field} value={field}>
                            {field} <small style={{ color: 'gray' }}>(category)</small>
                          </MenuItem>
                        ))}
                      {availableFields
                        .filter(field => !isCategoryField(field))
                        .map((field) => (
                          <MenuItem key={field} value={field}>
                            {field}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Multi-series Options</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">Enable multi-series mode:</Typography>
                      <Button 
                        variant={multiSeriesMode ? "contained" : "outlined"} 
                        size="small"
                        onClick={() => setMultiSeriesMode(!multiSeriesMode)}
                      >
                        {multiSeriesMode ? "Enabled" : "Disabled"}
                      </Button>
                    </Box>
                    
                    {multiSeriesMode && (
                      <>
                        <Typography variant="body2">Select data series:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ width: '100%', mb: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              Numeric fields (recommended):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {availableFields
                                .filter(field => field !== visualizationOptions.xField && isNumericField(field))
                                .map((field) => (
                                  <Chip
                                    key={field}
                                    label={field}
                                    color={seriesFields.includes(field) ? "primary" : "default"}
                                    onClick={() => toggleSeriesField(field)}
                                    size="small"
                                    sx={{ m: 0.5 }}
                                  />
                                ))}
                            </Box>
                          </Box>
                          
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="caption" color="textSecondary">
                              Other fields:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {availableFields
                                .filter(field => field !== visualizationOptions.xField && !isNumericField(field))
                                .map((field) => (
                                  <Chip
                                    key={field}
                                    label={field}
                                    color={seriesFields.includes(field) ? "primary" : "default"}
                                    onClick={() => toggleSeriesField(field)}
                                    size="small"
                                    sx={{ m: 0.5 }}
                                  />
                                ))}
                            </Box>
                          </Box>
                        </Box>
                      </>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleVisualize}
                startIcon={<BarChartIcon />}
              >
                Generate Chart
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {chartData.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Chart Results
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {renderChart()}
        </Paper>
      )}
    </Box>
  )
} 