import { useState, useEffect } from 'react'
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
  Chip,
  Stack,
  InputAdornment,
  Divider,
} from '@mui/material'
import { TreeView } from '@mui/x-tree-view/TreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
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
  Search,
  Info,
  ChevronRight,
  ArrowDropDown,
  FilterList,
  Fullscreen,
  FullscreenExit,
  Folder,
  FolderOpen,
  List as ListIcon,
  TextFields,
  Numbers,
  CheckBox,
  Help,
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Ajv from 'ajv'
import yaml from 'js-yaml'
import { JSONPath } from 'jsonpath-plus'

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

const COMMON_JSONPATH_EXAMPLES = [
  { label: 'All elements', path: '$[*]' },
  { label: 'All properties', path: '$.*' },
  { label: 'First element', path: '$[0]' },
  { label: 'Last element', path: '$[-1]' },
  { label: 'All names', path: '$..name' },
  { label: 'All values', path: '$..*' },
  { label: 'All numbers', path: '$..[?(@.type=="number")]' },
  { label: 'All strings', path: '$..[?(@.type=="string")]' },
]

const TEST_DATA = {
  store: {
    book: [
      {
        category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
        price: 8.95,
        inStock: true,
        tags: ["quotes", "reference"]
      },
      {
        category: "fiction",
        author: "Evelyn Waugh",
        title: "Sword of Honour",
        price: 12.99,
        inStock: false,
        tags: ["war", "fiction"]
      },
      {
        category: "fiction",
        author: "Herman Melville",
        title: "Moby Dick",
        price: 8.99,
        inStock: true,
        tags: ["adventure", "fiction"]
      },
      {
        category: "fiction",
        author: "J. R. R. Tolkien",
        title: "The Lord of the Rings",
        price: 22.99,
        inStock: true,
        tags: ["fantasy", "fiction"]
      }
    ],
    bicycle: {
      color: "red",
      price: 19.95,
      inStock: true,
      specs: {
        brand: "Giant",
        model: "Escape 3",
        year: 2023,
        features: ["disc brakes", "21 speeds", "aluminum frame"]
      }
    },
    location: {
      address: "123 Main St",
      city: "New York",
      country: "USA",
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    }
  }
}

const QUERY_EXAMPLES = [
  { label: 'Get all books', path: '$.store.book[*]' },
  { label: 'Get all authors', path: '$.store.book[*].author' },
  { label: 'Get all prices', path: '$..price' },
  { label: 'Get all tags', path: '$..tags[*]' },
  { label: 'Get in-stock items', path: '$..[?(@.inStock==true)]' },
  { label: 'Get items over $10', path: '$..[?(@.price>10)]' },
  { label: 'Get fiction books', path: '$.store.book[?(@.category=="fiction")]' },
  { label: 'Get books with fiction tag', path: "$.store.book[?(@.tags[?(@=='fiction')].length > 0)]" },
  { label: 'Get store location', path: '$.store.location' },
  { label: 'Get bicycle specs', path: '$.store.bicycle.specs' }
]

interface JsonNode {
  key: string
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  children?: JsonNode[]
  path: string
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
  const [jsonpathQuery, setJsonpathQuery] = useState('')
  const [queryResult, setQueryResult] = useState<any[]>([])
  const [queryError, setQueryError] = useState<string | null>(null)
  const [showQueryInfo, setShowQueryInfo] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [treeData, setTreeData] = useState<JsonNode[]>([])
  const [treeError, setTreeError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['root'])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

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
      setTabValue(1)
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

  const handleJsonpathQuery = () => {
    try {
      if (!input.trim()) {
        setQueryError('Please enter some JSON to query')
        return
      }
      if (!jsonpathQuery.trim()) {
        setQueryError('Please enter a JSONPath query')
        return
      }

      const jsonData = JSON.parse(input)
      const results = JSONPath({ path: jsonpathQuery, json: jsonData })
      setQueryResult(results)
      setQueryError(null)
    } catch (err) {
      setQueryError('Invalid JSON or JSONPath query')
      setQueryResult([])
    }
  }

  const handleExampleClick = (example: string) => {
    setJsonpathQuery(example)
    // Automatically execute the query
    try {
      if (!input.trim()) {
        setQueryError('Please enter some JSON to query')
        return
      }
      const jsonData = JSON.parse(input)
      const results = JSONPath({ path: example, json: jsonData })
      setQueryResult(results)
      setQueryError(null)
    } catch (err) {
      setQueryError('Invalid JSON or JSONPath query')
      setQueryResult([])
    }
  }

  const handleLoadTestData = () => {
    setInput(JSON.stringify(TEST_DATA, null, parseInt(indentSize)))
  }

  const parseJsonToTree = (data: any, key: string = 'root', path: string = ''): JsonNode => {
    if (data === null) {
      return { key, value: null, type: 'null', path }
    }

    const type = Array.isArray(data) ? 'array' : typeof data
    const node: JsonNode = { key, value: data, type: type as any, path }

    if (type === 'object') {
      node.children = Object.entries(data).map(([k, v]) => 
        parseJsonToTree(v, k, path ? `${path}.${k}` : k)
      )
    } else if (type === 'array') {
      node.children = data.map((item: any, index: number) => 
        parseJsonToTree(item, index.toString(), `${path}[${index}]`)
      )
    }

    return node
  }

  const handleTreeView = () => {
    try {
      if (!input.trim()) {
        setTreeError('Please enter some JSON to view')
        return
      }
      const jsonData = JSON.parse(input)
      const tree = parseJsonToTree(jsonData)
      setTreeData([tree])
      setTreeError(null)
    } catch (err) {
      setTreeError('Invalid JSON format')
      setTreeData([])
    }
  }

  const handleNodeSelect = (event: React.SyntheticEvent, nodeId: string) => {
    setSelectedNode(nodeId)
  }

  const handleNodeToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpandedNodes(nodeIds)
  }

  const handleExpandToggle = () => {
    if (isExpanded) {
      setExpandedNodes(['root'])
    } else {
      const getAllNodeIds = (nodes: JsonNode[]): string[] => {
        return nodes.reduce((acc: string[], node) => {
          acc.push(node.key)
          if (node.children) {
            acc.push(...getAllNodeIds(node.children))
          }
          return acc
        }, [])
      }
      setExpandedNodes(getAllNodeIds(treeData))
    }
    setIsExpanded(!isExpanded)
  }

  const handleFullscreen = () => {
    const treeViewElement = document.getElementById('tree-view-container')
    if (!treeViewElement) return

    if (!isFullscreen) {
      if (treeViewElement.requestFullscreen) {
        treeViewElement.requestFullscreen()
      } else if ((treeViewElement as any).webkitRequestFullscreen) {
        (treeViewElement as any).webkitRequestFullscreen()
      } else if ((treeViewElement as any).msRequestFullscreen) {
        (treeViewElement as any).msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  const handleCopyNodePath = () => {
    if (selectedNode) {
      const findNodePath = (nodes: JsonNode[], nodeId: string): string | null => {
        for (const node of nodes) {
          if (node.key === nodeId) return node.path
          if (node.children) {
            const path = findNodePath(node.children, nodeId)
            if (path) return path
          }
        }
        return null
      }
      const path = findNodePath(treeData, selectedNode)
      if (path) {
        navigator.clipboard.writeText(path)
        setSnackbarMessage('Node path copied to clipboard!')
        setSnackbar(true)
      }
    }
  }

  const handleCopyNodeValue = () => {
    if (selectedNode) {
      const findNodeValue = (nodes: JsonNode[], nodeId: string): any => {
        for (const node of nodes) {
          if (node.key === nodeId) return node.value
          if (node.children) {
            const value = findNodeValue(node.children, nodeId)
            if (value !== undefined) return value
          }
        }
        return undefined
      }
      const value = findNodeValue(treeData, selectedNode)
      if (value !== undefined) {
        navigator.clipboard.writeText(JSON.stringify(value))
        setSnackbarMessage('Node value copied to clipboard!')
        setSnackbar(true)
      }
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'object':
        return <Folder fontSize="small" />
      case 'array':
        return <ListIcon fontSize="small" />
      case 'string':
        return <TextFields fontSize="small" />
      case 'number':
        return <Numbers fontSize="small" />
      case 'boolean':
        return <CheckBox fontSize="small" />
      default:
        return <Help fontSize="small" />
    }
  }

  const searchInTree = (nodes: JsonNode[], query: string): string[] => {
    if (!query.trim()) return []
    
    const matches: string[] = []
    const searchLower = query.toLowerCase()

    const searchNode = (node: JsonNode) => {
      const nodeKey = node.key.toLowerCase()
      const nodeValue = String(node.value).toLowerCase()
      const nodeType = node.type.toLowerCase()

      if (
        nodeKey.includes(searchLower) ||
        nodeValue.includes(searchLower) ||
        nodeType.includes(searchLower)
      ) {
        matches.push(node.key)
      }

      if (node.children) {
        node.children.forEach(searchNode)
      }
    }

    nodes.forEach(searchNode)
    return matches
  }

  const getParentNodes = (nodes: JsonNode[], targetKey: string): string[] => {
    const parents: string[] = []

    const findParents = (node: JsonNode, parentPath: string[] = []) => {
      if (node.key === targetKey) {
        parents.push(...parentPath)
        return true
      }

      if (node.children) {
        return node.children.some(child => 
          findParents(child, [...parentPath, node.key])
        )
      }

      return false
    }

    nodes.forEach(node => findParents(node))
    return parents
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout for search
    const timeout = setTimeout(() => {
      if (query && treeData.length > 0) {
        const matches = searchInTree(treeData, query)
        if (matches.length > 0) {
          // Get all parent nodes of matches
          const parentNodes = matches.reduce((acc: string[], match) => {
            return [...acc, ...getParentNodes(treeData, match)]
          }, [])

          // Combine matches and their parents, remove duplicates
          const nodesToExpand = [...new Set([...matches, ...parentNodes])]
          setExpandedNodes(prev => [...new Set([...prev, ...nodesToExpand])])
        }
      } else {
        // If search is cleared, collapse all nodes except root
        setExpandedNodes(['root'])
      }
    }, 300) // 300ms debounce

    setSearchTimeout(timeout)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const renderTree = (nodes: JsonNode[]) => {
    const searchLower = searchQuery.toLowerCase()
    
    return nodes.map((node) => {
      const nodeKey = node.key.toLowerCase()
      const nodeValue = String(node.value).toLowerCase()
      const nodeType = node.type.toLowerCase()
      const isMatch = searchQuery && (
        nodeKey.includes(searchLower) ||
        nodeValue.includes(searchLower) ||
        nodeType.includes(searchLower)
      )

      return (
        <TreeItem
          key={node.key}
          nodeId={node.key}
          label={
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: isMatch ? 'rgba(255, 255, 0, 0.1)' : 'transparent',
                borderRadius: 1,
                px: 0.5
              }}
            >
              {getNodeIcon(node.type)}
              <Typography
                component="span"
                sx={{
                  fontWeight: node.type === 'object' || node.type === 'array' ? 'bold' : 'normal',
                  color: node.type === 'string' ? '#ce9178' :
                         node.type === 'number' ? '#b5cea8' :
                         node.type === 'boolean' ? '#569cd6' :
                         node.type === 'null' ? '#808080' : 'inherit'
                }}
              >
                {node.key}:
              </Typography>
              {node.type !== 'object' && node.type !== 'array' && (
                <Typography
                  component="span"
                  sx={{
                    color: node.type === 'string' ? '#ce9178' :
                           node.type === 'number' ? '#b5cea8' :
                           node.type === 'boolean' ? '#569cd6' :
                           node.type === 'null' ? '#808080' : 'inherit'
                  }}
                >
                  {node.type === 'string' ? `"${node.value}"` : String(node.value)}
                </Typography>
              )}
              {(node.type === 'object' || node.type === 'array') && (
                <Typography
                  component="span"
                  sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                >
                  {node.type === 'object' 
                    ? `{${node.children?.length || 0} properties}`
                    : `[${node.children?.length || 0} items]`}
                </Typography>
              )}
            </Box>
          }
        >
          {node.children && renderTree(node.children)}
        </TreeItem>
      )
    })
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
          <Tab label="Schema Validation" />
          <Tab label="Convert" />
          <Tab label="Query" />
          <Tab label="Tree View" />
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
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
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

      <TabPanel value={tabValue} index={3}>
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

      <TabPanel value={tabValue} index={4}>
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
            <IconButton
              onClick={() => setShowQueryInfo(!showQueryInfo)}
              color="primary"
              size="small"
            >
              <Info />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowGuide(!showGuide)}
              startIcon={showGuide ? <ExpandLess /> : <ExpandMoreIcon />}
            >
              Guide
            </Button>
          </Box>

          <Collapse in={showGuide}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                JSONPath Query Guide
              </Typography>
              <Typography variant="body2" paragraph>
                This guide provides a sample JSON data and common JSONPath query examples.
                Click "Load Test Data" to load the sample data, then try the queries below.
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={handleLoadTestData}
                sx={{ mb: 2 }}
              >
                Load Test Data
              </Button>
              <Typography variant="subtitle2" gutterBottom>
                Sample Queries:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {QUERY_EXAMPLES.map((example, index) => (
                  <Chip
                    key={index}
                    label={`${example.label}: ${example.path}`}
                    onClick={() => handleExampleClick(example.path)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Paper>
          </Collapse>

          <Collapse in={showQueryInfo}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Common JSONPath Examples:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {COMMON_JSONPATH_EXAMPLES.map((example, index) => (
                  <Chip
                    key={index}
                    label={`${example.label}: ${example.path}`}
                    onClick={() => handleExampleClick(example.path)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Paper>
          </Collapse>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter JSON to query..."
              error={!!queryError}
              helperText={queryError}
              sx={{ flex: 1 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
              <Tooltip title="Paste">
                <IconButton onClick={handlePaste} color="primary">
                  <ContentPaste />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              value={jsonpathQuery}
              onChange={(e) => setJsonpathQuery(e.target.value)}
              placeholder="Enter JSONPath query (e.g., $..name)"
              error={!!queryError}
              sx={{ flex: 1 }}
            />
            <Tooltip title="Search">
              <IconButton onClick={handleJsonpathQuery} color="primary">
                <Search />
              </IconButton>
            </Tooltip>
          </Box>

          {queryResult.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Paper sx={{ p: 2, position: 'relative', flex: 1 }}>
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(queryResult, null, parseInt(indentSize)))
                    setSnackbarMessage('Query results copied to clipboard!')
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
                  {JSON.stringify(queryResult, null, parseInt(indentSize))}
                </SyntaxHighlighter>
              </Paper>
              <Box sx={{ width: 48 }} /> {/* Spacer to align with input buttons */}
            </Box>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter JSON to view as tree..."
              error={!!treeError}
              helperText={treeError}
              sx={{ flex: 1 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
              <Tooltip title="Paste">
                <IconButton onClick={handlePaste} color="primary">
                  <ContentPaste />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Tree">
                <IconButton onClick={handleTreeView} color="primary">
                  <ExpandMore />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {treeData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Search in tree..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Tooltip title={isExpanded ? "Collapse All" : "Expand All"}>
                  <IconButton onClick={handleExpandToggle} size="small">
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                  <IconButton onClick={handleFullscreen} size="small">
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                </Tooltip>
                {selectedNode && (
                  <>
                    <Divider orientation="vertical" flexItem />
                    <Tooltip title="Copy Node Path">
                      <IconButton onClick={handleCopyNodePath} size="small">
                        <Code />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy Node Value">
                      <IconButton onClick={handleCopyNodeValue} size="small">
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
              <Box id="tree-view-container">
                <TreeView
                  defaultCollapseIcon={<ArrowDropDown />}
                  defaultExpandIcon={<ChevronRight />}
                  expanded={expandedNodes}
                  selected={selectedNode}
                  onNodeSelect={handleNodeSelect}
                  onNodeToggle={handleNodeToggle}
                  sx={{
                    height: isFullscreen ? 'calc(100vh - 100px)' : 400,
                    flexGrow: 1,
                    maxWidth: '100%',
                    overflowY: 'auto',
                    '& .MuiTreeItem-root': {
                      '& .MuiTreeItem-content': {
                        padding: '4px 0',
                      },
                    },
                  }}
                >
                  {renderTree(treeData)}
                </TreeView>
              </Box>
            </Paper>
          )}
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