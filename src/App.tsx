import { useState } from 'react'
import {
  Box,
  Container,
  TextField,
  Typography,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  FormatPaint,
  ExpandMore,
  Compress,
  Code,
  Download,
  Upload,
  Compare,
  Settings,
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`json-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function App() {
  const [input, setInput] = useState('')
  const [formatted, setFormatted] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [indentSize, setIndentSize] = useState('2')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [compareInput, setCompareInput] = useState('')
  const [diffResult, setDiffResult] = useState('')

  const handleFormat = () => {
    try {
      if (!input.trim()) {
        setError('Please enter some JSON to format')
        return
      }
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, parseInt(indentSize))
      setFormatted(formatted)
      setError(null)
    } catch (err) {
      setError('Invalid JSON format')
      setFormatted('')
    }
  }

  const handleCopy = () => {
    if (formatted) {
      navigator.clipboard.writeText(formatted)
      setSnackbarMessage('Copied to clipboard!')
      setSnackbar(true)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch (err) {
      setError('Failed to read from clipboard')
    }
  }

  const handleDownload = () => {
    if (formatted) {
      const blob = new Blob([formatted], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'formatted.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
      }
      reader.readAsText(file)
    }
  }

  const handleMinify = () => {
    try {
      if (!input.trim()) {
        setError('Please enter some JSON to minify')
        return
      }
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setFormatted(minified)
      setError(null)
    } catch (err) {
      setError('Invalid JSON format')
      setFormatted('')
    }
  }

  const handleCompare = () => {
    try {
      const obj1 = JSON.parse(input)
      const obj2 = JSON.parse(compareInput)
      const diff = findDifferences(obj1, obj2)
      setDiffResult(JSON.stringify(diff, null, parseInt(indentSize)))
      setTabValue(2)
    } catch (err) {
      setError('Invalid JSON format in one or both inputs')
    }
  }

  const findDifferences = (obj1: any, obj2: any, path = ''): any => {
    const diff: any = {}
    
    for (const key in obj1) {
      const currentPath = path ? `${path}.${key}` : key
      
      if (!(key in obj2)) {
        diff[key] = { removed: obj1[key] }
      } else if (typeof obj1[key] === 'object' && obj1[key] !== null &&
                 typeof obj2[key] === 'object' && obj2[key] !== null) {
        const nestedDiff = findDifferences(obj1[key], obj2[key], currentPath)
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff
        }
      } else if (obj1[key] !== obj2[key]) {
        diff[key] = {
          old: obj1[key],
          new: obj2[key]
        }
      }
    }

    for (const key in obj2) {
      if (!(key in obj1)) {
        diff[key] = { added: obj2[key] }
      }
    }

    return diff
  }

  const handleIndentSizeChange = (event: SelectChangeEvent) => {
    setIndentSize(event.target.value)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        JSON Formatter
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Format" />
          <Tab label="Compare" />
          <Tab label="Diff Result" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            error={!!error}
            helperText={error}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Tooltip title="Paste">
              <IconButton onClick={handlePaste} color="primary">
                <ContentPaste />
              </IconButton>
            </Tooltip>
            <Tooltip title="Format">
              <IconButton onClick={handleFormat} color="primary">
                <FormatPaint />
              </IconButton>
            </Tooltip>
            <Tooltip title="Minify">
              <IconButton onClick={handleMinify} color="primary">
                <Compress />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton onClick={handleDownload} color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Upload">
              <IconButton component="label" color="primary">
                <Upload />
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleUpload}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {formatted && (
          <Paper sx={{ p: 2, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Indent</InputLabel>
                <Select
                  value={indentSize}
                  label="Indent"
                  onChange={handleIndentSizeChange}
                  size="small"
                >
                  <MenuItem value="2">2 spaces</MenuItem>
                  <MenuItem value="4">4 spaces</MenuItem>
                  <MenuItem value="8">8 spaces</MenuItem>
                </Select>
              </FormControl>
              <IconButton onClick={handleCopy} color="primary" title="Copy">
                <ContentCopy />
              </IconButton>
            </Box>
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 4 }}
            >
              {formatted}
            </SyntaxHighlighter>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="First JSON..."
            error={!!error}
            helperText={error}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            value={compareInput}
            onChange={(e) => setCompareInput(e.target.value)}
            placeholder="Second JSON..."
            error={!!error}
          />
          <Button
            variant="contained"
            onClick={handleCompare}
            startIcon={<Compare />}
          >
            Compare JSONs
          </Button>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {diffResult && (
          <Paper sx={{ p: 2, position: 'relative' }}>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(diffResult)
                setSnackbarMessage('Diff copied to clipboard!')
                setSnackbar(true)
              }}
              sx={{ position: 'absolute', top: 8, right: 8 }}
              color="primary"
              title="Copy"
            >
              <ContentCopy />
            </IconButton>
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 4 }}
            >
              {diffResult}
            </SyntaxHighlighter>
          </Paper>
        )}
      </TabPanel>

      <Snackbar
        open={snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(false)}
      >
        <Alert severity="success" onClose={() => setSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default App 