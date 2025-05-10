import { useState } from 'react'
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
  SelectChangeEvent
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon
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
  Cell
} from 'recharts'
import { ChartData, VisualizationOptions } from '../types'
import { flattenObject, processData } from '../utils/jsonUtils'

interface VisualizePanelProps {
  onSnackbar: (message: string) => void
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function VisualizePanel({ onSnackbar }: VisualizePanelProps) {
  const [input, setInput] = useState('')
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [visualizationError, setVisualizationError] = useState<string | null>(null)
  const [visualizationOptions, setVisualizationOptions] = useState<VisualizationOptions>({
    chartType: 'bar',
    xField: '',
    yField: '',
    colorField: ''
  })

  const handleVisualize = () => {
    try {
      if (!input.trim()) {
        setVisualizationError('Please enter some JSON data')
        return
      }

      const jsonData = JSON.parse(input)
      const flattenedData = processData(flattenObject(jsonData))
      
      if (!visualizationOptions.xField || !visualizationOptions.yField) {
        setVisualizationError('Please select X and Y fields')
        return
      }

      const data = Array.isArray(flattenedData) ? flattenedData : [flattenedData]
      const chartData = data.map((item, index) => ({
        name: item[visualizationOptions.xField]?.toString() || `Item ${index + 1}`,
        value: Number(item[visualizationOptions.yField]) || 0,
        color: item[visualizationOptions.colorField]?.toString() || COLORS[index % COLORS.length]
      }))

      setChartData(chartData)
      setVisualizationError(null)
    } catch (err) {
      setVisualizationError('Invalid JSON format')
      setChartData([])
    }
  }

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setVisualizationOptions(prev => ({
      ...prev,
      chartType: event.target.value as 'bar' | 'line' | 'pie'
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
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
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
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
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
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
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
            <MenuItem value="line">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LineChartIcon /> Line Chart
              </Box>
            </MenuItem>
            <MenuItem value="pie">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon /> Pie Chart
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>X Field</InputLabel>
          <Select
            value={visualizationOptions.xField}
            label="X Field"
            onChange={(e) => handleFieldChange('xField', e.target.value)}
          >
            {Object.keys(flattenObject(JSON.parse(input || '{}'))).map((field) => (
              <MenuItem key={field} value={field}>{field}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Y Field</InputLabel>
          <Select
            value={visualizationOptions.yField}
            label="Y Field"
            onChange={(e) => handleFieldChange('yField', e.target.value)}
          >
            {Object.keys(flattenObject(JSON.parse(input || '{}'))).map((field) => (
              <MenuItem key={field} value={field}>{field}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Color Field</InputLabel>
          <Select
            value={visualizationOptions.colorField}
            label="Color Field"
            onChange={(e) => handleFieldChange('colorField', e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {Object.keys(flattenObject(JSON.parse(input || '{}'))).map((field) => (
              <MenuItem key={field} value={field}>{field}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter JSON data..."
            error={!!visualizationError}
            helperText={visualizationError}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            <Tooltip title="Paste">
              <IconButton onClick={handlePaste} color="primary">
                <ContentPaste />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visualize">
              <IconButton onClick={handleVisualize} color="primary">
                <BarChartIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {chartData.length > 0 && (
          <Paper sx={{ p: 2 }}>
            {renderChart()}
          </Paper>
        )}
      </Box>
    </Box>
  )
} 