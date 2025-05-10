import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  ShowChart,
  GridOn as TreemapIcon
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
    id: 'example1',
    data: JSON.stringify([
      { "Month": "January", "Sales": 1200, "Cost": 800, "Profit": 400, "Category": "Electronics" },
      { "Month": "February", "Sales": 1900, "Cost": 1200, "Profit": 700, "Category": "Electronics" },
      { "Month": "March", "Sales": 1500, "Cost": 900, "Profit": 600, "Category": "Electronics" },
      { "Month": "April", "Sales": 2200, "Cost": 1400, "Profit": 800, "Category": "Electronics" },
      { "Month": "May", "Sales": 2800, "Cost": 1800, "Profit": 1000, "Category": "Electronics" }
    ], null, 2)
  },
  {
    id: 'example2',
    data: JSON.stringify([
      { "Region": "North", "Electronics": 4200, "Clothing": 2800, "Food": 3500 },
      { "Region": "East", "Electronics": 5500, "Clothing": 3100, "Food": 4100 },
      { "Region": "South", "Electronics": 6100, "Clothing": 4200, "Food": 3800 },
      { "Region": "West", "Electronics": 3800, "Clothing": 2600, "Food": 2900 }
    ], null, 2)
  },
  {
    id: 'example3',
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
  const { t } = useTranslation();
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
        setVisualizationError(t('common.error.emptyInput', { content: 'JSON data', action: 'visualize' }));
        return
      }

      const jsonData = JSON.parse(input)
      
      if (!visualizationOptions.xField || (!visualizationOptions.yField && !multiSeriesMode)) {
        setVisualizationError(t('visualize.selectFields'));
        return
      }
      
      if (multiSeriesMode && seriesFields.length === 0) {
        setVisualizationError(t('visualize.selectSeries'));
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
        setVisualizationError(t('visualize.noDataPoints'));
        return
      }
      
      setChartData(chartData)
      setVisualizationError(null)
      onSnackbar(t('visualize.chartUpdated'))
    } catch (err) {
      console.error(err)
      setVisualizationError(t('common.error.invalidJson'));
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
      setVisualizationError(t('common.error.clipboard'));
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input)
      onSnackbar(t('common.copied', { content: 'JSON' }));
    } catch (err) {
      setVisualizationError(t('common.error.clipboard'));
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
              stroke="#fff"
              fill="#8884d8"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]} 
                />
              ))}
            </Treemap>
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
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('visualize.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('visualize.description')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {(() => {
            try {
              const keywords = t('visualize.keywords', { returnObjects: true });
              if (Array.isArray(keywords)) {
                return keywords.map((keyword, index) => (
                  <Chip 
                    key={index} 
                    label={String(keyword)} 
                    size="small" 
                    variant="outlined" 
                    sx={{ borderRadius: 1 }} 
                  />
                ));
              }
            } catch (error) {
              console.error('Error rendering keywords:', error);
            }
            return null;
          })()}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('visualize.jsonData')}
                </Typography>
                <Box>
                  <Tooltip title={t('format.paste')}>
                    <IconButton onClick={handlePaste} size="small">
                      <ContentPaste fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('format.copy')}>
                    <IconButton onClick={handleCopy} size="small">
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('visualize.enterJson')}
                error={!!visualizationError}
                helperText={visualizationError}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => setDataExample(!dataExample)}
                >
                  {t('visualize.loadExample')}
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleVisualize}
                  disabled={!input.trim()}
                >
                  {t('visualize.visualize')}
                </Button>
              </Box>
              
              {dataExample && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('visualize.examples')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {EXAMPLE_DATA.map((example, index) => (
                      <Button 
                        key={index}
                        variant="outlined" 
                        size="small"
                        onClick={() => loadExampleData(example.data)}
                      >
                        {t(`visualize.exampleData.${example.id}`)}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('visualize.chartOptions')}
              </Typography>
              
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>{t('visualize.chartType')}</InputLabel>
                <Select
                  value={visualizationOptions.chartType}
                  label={t('visualize.chartType')}
                  onChange={handleChartTypeChange}
                >
                  <MenuItem value="bar">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BarChartIcon sx={{ mr: 1 }} fontSize="small" />
                      {t('visualize.barChart')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="line">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LineChartIcon sx={{ mr: 1 }} fontSize="small" />
                      {t('visualize.lineChart')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="pie">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PieChartIcon sx={{ mr: 1 }} fontSize="small" />
                      {t('visualize.pieChart')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="donut">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DonutChartIcon sx={{ mr: 1 }} fontSize="small" />
                      {t('visualize.donutChart')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="area">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShowChart sx={{ mr: 1 }} fontSize="small" />
                      {t('visualize.areaChart')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="stackedBar">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StackedBarChartIcon sx={{ mr: 1 }} fontSize="small" />
                      {t('visualize.stackedBarChart')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="scatter">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScatterChartIcon sx={{ mr: 1 }} fontSize="small" />
                      {t('visualize.scatterChart')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="radar">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShowChart sx={{ mr: 1 }} fontSize="small" />
                      {t('visualize.radarChart')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="treemap">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TreemapIcon sx={{ mr: 1 }} fontSize="small" />
                      {t('visualize.treemapChart')}
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>{t('visualize.xAxisField')}</InputLabel>
                <Select
                  value={visualizationOptions.xField}
                  label={t('visualize.xAxisField')}
                  onChange={(e) => handleFieldChange('xField', e.target.value)}
                  disabled={availableFields.length === 0}
                >
                  {availableFields.map((field) => (
                    <MenuItem key={field} value={field}>
                      {field} {isCategoryField(field) ? `(${t('visualize.category')})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {!multiSeriesMode && (
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>{t('visualize.yAxisField')}</InputLabel>
                  <Select
                    value={visualizationOptions.yField}
                    label={t('visualize.yAxisField')}
                    onChange={(e) => handleFieldChange('yField', e.target.value)}
                    disabled={availableFields.length === 0}
                  >
                    {availableFields
                      .filter(field => isNumericField(field))
                      .map((field) => (
                        <MenuItem key={field} value={field}>
                          {field} {isNumericField(field) ? `(${t('visualize.numeric')})` : ''}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <Button
                  variant={multiSeriesMode ? "contained" : "outlined"}
                  size="small"
                  color={multiSeriesMode ? "primary" : "inherit"}
                  onClick={() => setMultiSeriesMode(!multiSeriesMode)}
                  disabled={availableFields.length === 0}
                >
                  {multiSeriesMode ? t('visualize.multiSeriesEnabled') : t('visualize.enableMultiSeries')}
                </Button>
              </Box>
              
              {multiSeriesMode && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('visualize.selectDataSeries')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableFields
                      .filter(field => field !== visualizationOptions.xField && isNumericField(field))
                      .map((field) => (
                        <Chip
                          key={field}
                          label={field}
                          clickable
                          color={seriesFields.includes(field) ? "primary" : "default"}
                          onClick={() => toggleSeriesField(field)}
                          variant={seriesFields.includes(field) ? "filled" : "outlined"}
                        />
                      ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {chartData.length > 0 && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {t('visualize.chart')}
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              {renderChart()}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  )
} 