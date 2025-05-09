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
  List,
  ListItem,
  ListItemText,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
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
  ExpandLess,
  ExpandMore as ExpandMoreIcon,
  SwapHoriz,
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Ajv from 'ajv'
import yaml from 'js-yaml'

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
  const [formatError, setFormatError] = useState<string | null>(null)
  const [compareError, setCompareError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [indentSize, setIndentSize] = useState('2')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [compareInput, setCompareInput] = useState('')
  const [diffResult, setDiffResult] = useState('')
  const [schemaInput, setSchemaInput] = useState('')
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [conversionType, setConversionType] = useState<'json' | 'yaml'>('json')
  const [convertedOutput, setConvertedOutput] = useState('')
  const [conversionError, setConversionError] = useState<string | null>(null)

  const handleFormat = () => {
    try {
      if (!input.trim()) {
        setFormatError('Please enter some JSON to format')
        return
      }
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, parseInt(indentSize))
      setFormatted(formatted)
      setFormatError(null)
    } catch (err) {
      setFormatError('Invalid JSON format')
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
      setFormatError('Failed to read from clipboard')
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
        setFormatError('Please enter some JSON to minify')
        return
      }
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setFormatted(minified)
      setFormatError(null)
    } catch (err) {
      setFormatError('Invalid JSON format')
      setFormatted('')
    }
  }

  const handleCompare = () => {
    try {
      const obj1 = JSON.parse(input)
      const obj2 = JSON.parse(compareInput)
      const diff = findDifferences(obj1, obj2)
      setDiffResult(JSON.stringify(diff, null, 2))
      setCompareError(null)
      setTabValue(2)
    } catch (err) {
      setCompareError('Invalid JSON format in one or both inputs')
    }
  }

  const handleValidate = () => {
    try {
      if (!input.trim() || !schemaInput.trim()) {
        setValidationError('Please enter both JSON and Schema')
        return
      }

      const jsonData = JSON.parse(input)
      const schema = JSON.parse(schemaInput)
      
      const ajv = new Ajv({ allErrors: true })
      const validate = ajv.compile(schema)
      const valid = validate(jsonData)

      if (valid) {
        setValidationErrors([])
        setValidationError(null)
        setSnackbarMessage('JSON is valid according to the schema!')
        setSnackbar(true)
      } else {
        setValidationErrors(validate.errors || [])
        setValidationError('JSON validation failed')
      }
    } catch (err) {
      setValidationError('Invalid JSON or Schema format')
      setValidationErrors([])
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

  const handleConvert = () => {
    try {
      if (!input.trim()) {
        setConversionError('Please enter some content to convert')
        return
      }

      if (conversionType === 'json') {
        // Convert JSON to YAML
        const jsonData = JSON.parse(input)
        const yamlOutput = yaml.dump(jsonData, {
          indent: parseInt(indentSize),
          lineWidth: -1, // No line wrapping
          noRefs: true, // Don't use YAML references
        })
        setConvertedOutput(yamlOutput)
      } else {
        // Convert YAML to JSON
        const jsonData = yaml.load(input)
        const jsonOutput = JSON.stringify(jsonData, null, parseInt(indentSize))
        setConvertedOutput(jsonOutput)
      }
      setConversionError(null)
    } catch (err) {
      setConversionError('Invalid format')
      setConvertedOutput('')
    }
  }

  const handleConversionTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'json' | 'yaml' | null
  ) => {
    if (newType !== null) {
      setConversionType(newType)
      setConvertedOutput('')
      setConversionError(null)
    }
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
          <Tab label="Schema Validation" />
          <Tab label="Convert" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              error={!!formatError}
              helperText={formatError}
              sx={{ flex: 1 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Paper sx={{ p: 2, position: 'relative', flex: 1 }}>
                <IconButton
                  onClick={handleCopy}
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
                  {formatted}
                </SyntaxHighlighter>
              </Paper>
              <Box sx={{ width: 48 }} /> {/* Spacer to align with input buttons */}
            </Box>
          )}
        </Box>
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
            error={!!compareError}
            helperText={compareError}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            value={compareInput}
            onChange={(e) => setCompareInput(e.target.value)}
            placeholder="Second JSON..."
            error={!!compareError}
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

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter JSON to validate..."
              error={!!validationError}
              helperText={validationError}
            />
            <TextField
              fullWidth
              multiline
              rows={8}
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              placeholder="Enter JSON Schema..."
              error={!!validationError}
            />
          </Box>
          <Button
            variant="contained"
            onClick={handleValidate}
            startIcon={<Code />}
          >
            Validate JSON
          </Button>

          {validationErrors.length > 0 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  Validation Errors
                </Typography>
                <IconButton
                  onClick={() => setShowValidationErrors(!showValidationErrors)}
                >
                  {showValidationErrors ? <ExpandLess /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={showValidationErrors}>
                <List>
                  {validationErrors.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${error.instancePath || 'root'}: ${error.message}`}
                        secondary={`Schema path: ${error.schemaPath}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Paper>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ToggleButtonGroup
              value={conversionType}
              exclusive
              onChange={handleConversionTypeChange}
              aria-label="conversion type"
            >
              <ToggleButton value="json" aria-label="json to yaml">
                JSON → YAML
              </ToggleButton>
              <ToggleButton value="yaml" aria-label="yaml to json">
                YAML → JSON
              </ToggleButton>
            </ToggleButtonGroup>
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
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={conversionType === 'json' ? "Enter JSON..." : "Enter YAML..."}
                error={!!conversionError}
                helperText={conversionError}
                sx={{ flex: 1 }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
                <Tooltip title="Paste">
                  <IconButton onClick={handlePaste} color="primary">
                    <ContentPaste />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Convert">
                  <IconButton onClick={handleConvert} color="primary">
                    <SwapHoriz />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {convertedOutput && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Paper sx={{ p: 2, position: 'relative', flex: 1 }}>
                  <IconButton
                    onClick={() => {
                      navigator.clipboard.writeText(convertedOutput)
                      setSnackbarMessage('Converted output copied to clipboard!')
                      setSnackbar(true)
                    }}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    color="primary"
                    title="Copy"
                  >
                    <ContentCopy />
                  </IconButton>
                  <SyntaxHighlighter
                    language={conversionType === 'json' ? 'yaml' : 'json'}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, borderRadius: 4 }}
                  >
                    {convertedOutput}
                  </SyntaxHighlighter>
                </Paper>
                <Box sx={{ width: 48 }} /> {/* Spacer to align with input buttons */}
              </Box>
            )}
          </Box>
        </Box>
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