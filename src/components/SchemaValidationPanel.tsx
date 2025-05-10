import { useState } from 'react'
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  Button,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  FormHelperText,
  Badge,
  Chip,
  Stack
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  ExpandMore,
  ExpandLess,
  Check,
  Error as ErrorIcon,
  PlayArrow,
  Article,
  FormatListBulleted
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

// Schema templates
const SCHEMA_TEMPLATES = [
  {
    name: 'Generic Object',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        email: { type: 'string', format: 'email' }
      },
      required: ['name', 'age']
    }
  },
  {
    name: 'User List',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          active: { type: 'boolean' }
        },
        required: ['id', 'name']
      }
    }
  },
  {
    name: 'Configuration Object',
    schema: {
      type: 'object',
      properties: {
        appName: { type: 'string' },
        version: { type: 'string' },
        settings: {
          type: 'object',
          properties: {
            darkMode: { type: 'boolean' },
            notifications: { type: 'boolean' },
            language: { 
              type: 'string',
              enum: ['en', 'es', 'fr', 'zh']
            }
          }
        }
      },
      required: ['appName', 'version']
    }
  }
]

// Example data
const DATA_EXAMPLES = [
  {
    name: 'Generic Object',
    data: {
      name: "John Doe",
      age: 30,
      email: "john.doe@example.com"
    }
  },
  {
    name: 'User List',
    data: [
      { id: 1, name: "John", email: "john@example.com", active: true },
      { id: 2, name: "Jane", email: "jane@example.com", active: false }
    ]
  },
  {
    name: 'Configuration Object',
    data: {
      appName: "MyApp",
      version: "1.0.0",
      settings: {
        darkMode: true,
        notifications: false,
        language: "en"
      }
    }
  }
]

interface ValidationErrorDetails {
  path: string
  message: string
  keyword: string
  params: Record<string, any>
  data?: any
}

interface SchemaValidationPanelProps {
  onSnackbar: (message: string) => void
}

export function SchemaValidationPanel({ onSnackbar }: SchemaValidationPanelProps) {
  const [input, setInput] = useState('')
  const [schemaInput, setSchemaInput] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrorDetails[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [selectedErrorPath, setSelectedErrorPath] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [selectedDataExample, setSelectedDataExample] = useState<number | ''>('')
  const [selectedSchemaTemplate, setSelectedSchemaTemplate] = useState<number | ''>('')
  
  // Load template
  const handleLoadTemplate = (index: number) => {
    setSchemaInput(JSON.stringify(SCHEMA_TEMPLATES[index].schema, null, 2));
    setSelectedSchemaTemplate(index);
    
    // Automatically load corresponding example data
    if (SCHEMA_TEMPLATES[index].name === DATA_EXAMPLES[index].name) {
      setInput(JSON.stringify(DATA_EXAMPLES[index].data, null, 2));
      setSelectedDataExample(index);
      onSnackbar(`Schema template and matching example data loaded: ${SCHEMA_TEMPLATES[index].name}`);
    } else {
      onSnackbar('Schema template loaded');
    }
  }
  
  // Load example data
  const handleLoadExample = (index: number) => {
    setInput(JSON.stringify(DATA_EXAMPLES[index].data, null, 2));
    setSelectedDataExample(index);
    
    // Automatically load corresponding schema template
    if (DATA_EXAMPLES[index].name === SCHEMA_TEMPLATES[index].name) {
      setSchemaInput(JSON.stringify(SCHEMA_TEMPLATES[index].schema, null, 2));
      setSelectedSchemaTemplate(index);
      onSnackbar(`Example data and matching schema template loaded: ${DATA_EXAMPLES[index].name}`);
    } else {
      onSnackbar('Example data loaded');
    }
  }

  // Validation logic
  const handleValidate = () => {
    try {
      if (!input.trim() || !schemaInput.trim()) {
        setValidationError('Please enter both JSON data and schema')
        return
      }

      const jsonData = JSON.parse(input)
      const schema = JSON.parse(schemaInput)

      const ajv = new Ajv({ 
        allErrors: true,
        verbose: true
      })
      addFormats(ajv) // Add email, date and other format validations
      
      const validate = ajv.compile(schema)
      const valid = validate(jsonData)

      if (valid) {
        setValidationErrors([])
        setValidationError(null)
        setIsValid(true)
        onSnackbar('JSON is valid according to the schema!', 'success')
      } else {
        // More detailed error information
        const errors = validate.errors?.map(error => {
          // Get actual data value based on error path
          let dataValue;
          if (error.instancePath) {
            try {
              // Extract the actual value from JSON data at the corresponding path
              const path = error.instancePath.split('/').filter(p => p);
              let current = jsonData;
              for (const segment of path) {
                current = current[segment];
              }
              dataValue = current;
            } catch (e) {
              // If path parsing fails, use the data provided by the error object
              dataValue = error.data;
            }
          } else {
            // If there's no path, it might be the root object or something else
            dataValue = error.data || jsonData;
          }
          
          return {
            path: error.instancePath || 'root',
            message: error.message || 'Invalid value',
            keyword: error.keyword,
            params: error.params,
            data: dataValue  // 将提取的实际数据值添加到错误对象
          };
        }) || [];
        
        setValidationErrors(errors as ValidationErrorDetails[])
        setValidationError('JSON is invalid according to the schema')
        setIsValid(false)
        setShowValidationErrors(true)
      }
    } catch (err: any) {
      setValidationError(`Error: ${err.message || 'Invalid JSON or schema format'}`)
      setValidationErrors([])
      setIsValid(false)
    }
  }

  const handlePaste = async (isSchema: boolean) => {
    try {
      const text = await navigator.clipboard.readText()
      if (isSchema) {
        setSchemaInput(text)
      } else {
        setInput(text)
      }
    } catch (err) {
      setValidationError('Failed to read from clipboard')
    }
  }
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onSnackbar('Copied to clipboard!');
  }
  
  // Helper function for error details
  const getErrorDetails = (error: ValidationErrorDetails) => {
    switch (error.keyword) {
      case 'type': {
        // Get actual value directly
        const actualValue = error.data;
        
        // Determine actual type
        let actualType;
        if (actualValue === undefined) {
          // Special handling for undefined, which might be due to path issues
          actualType = 'undefined';
        } else if (actualValue === null) {
          actualType = 'null';
        } else if (Array.isArray(actualValue)) {
          actualType = 'array';
        } else {
          actualType = typeof actualValue;
        }
        
        // Create value representation
        let displayValue = '';
        if (actualValue !== undefined) {
          try {
            const valueStr = JSON.stringify(actualValue);
            if (valueStr && valueStr.length < 50) {
              displayValue = ` (Value: ${valueStr})`;
            }
          } catch (e) {
            // Ignore serialization errors
          }
        }
        
        return `Expected type '${error.params.type}', got '${actualType}'${displayValue}`;
      }
      
      case 'required':
        return `Missing required property: '${error.params.missingProperty}'`;
      
      case 'enum': {
        // Handle enum type errors
        let valueStr = '';
        const actualValue = error.data;
        if (actualValue !== undefined) {
          try {
            valueStr = JSON.stringify(actualValue);
            if (valueStr && valueStr.length > 50) {
              valueStr = valueStr.substring(0, 47) + '...';
            }
          } catch (e) {
            valueStr = String(actualValue);
          }
        }
        
        return `Value ${valueStr} must be one of: ${error.params.allowedValues?.join(', ')}`;
      }
      
      case 'format': {
        // Format errors
        let valueStr = '';
        try {
          valueStr = JSON.stringify(error.data);
          if (valueStr && valueStr.length > 30) {
            valueStr = valueStr.substring(0, 27) + '...';
          }
          return `Value ${valueStr} has invalid format for '${error.params.format}'`;
        } catch (e) {
          return `Invalid format for type '${error.params.format}'`;
        }
      }
      
      case 'minimum': {
        // Minimum value errors
        try {
          return `Value ${error.data} must be >= ${error.params.limit}`;
        } catch (e) {
          return `Value must be >= ${error.params.limit}`;
        }
      }
      
      case 'maximum': {
        // Maximum value errors
        try {
          return `Value ${error.data} must be <= ${error.params.limit}`;
        } catch (e) {
          return `Value must be <= ${error.params.limit}`;
        }
      }
      
      case 'minLength': {
        // Minimum length errors
        try {
          const strValue = String(error.data || '');
          return `String '${strValue.length > 20 ? strValue.substring(0, 17) + '...' : strValue}' length (${strValue.length}) must be >= ${error.params.limit}`;
        } catch (e) {
          return `String length must be >= ${error.params.limit}`;
        }
      }
      
      case 'maxLength': {
        // Maximum length errors
        try {
          const strValue = String(error.data || '');
          return `String length (${strValue.length}) must be <= ${error.params.limit}`;
        } catch (e) {
          return `String length must be <= ${error.params.limit}`;
        }
      }
      
      case 'pattern': {
        // Pattern matching errors
        try {
          const strValue = String(error.data || '');
          return `String '${strValue.length > 15 ? strValue.substring(0, 12) + '...' : strValue}' must match pattern: ${error.params.pattern}`;
        } catch (e) {
          return `String must match pattern: ${error.params.pattern}`;
        }
      }
      
      default:
        // Return original error message by default
        return error.message || 'Unknown validation error';
    }
  }
  
  // Highlight data with error
  const highlightDataWithError = () => {
    if (!selectedErrorPath || !input) return input;
    
    try {
      const jsonData = JSON.parse(input);
      
      // Helper function: display JSON string with highlighting
      const highlightJSON = (obj: any, path: string) => {
        return JSON.stringify(obj, null, 2);
      };
      
      return highlightJSON(jsonData, selectedErrorPath);
    } catch {
      return input;
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* 顶部操作栏 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Load Example Data</InputLabel>
              <Select
                value={selectedDataExample}
                label="Load Example Data"
                onChange={(e) => {
                  const index = parseInt(e.target.value as string);
                  if (!isNaN(index)) handleLoadExample(index);
                }}
              >
                {DATA_EXAMPLES.map((example, index) => (
                  <MenuItem key={index} value={index}>{example.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Load Schema Template</InputLabel>
              <Select
                value={selectedSchemaTemplate}
                label="Load Schema Template"
                onChange={(e) => {
                  const index = parseInt(e.target.value as string);
                  if (!isNaN(index)) handleLoadTemplate(index);
                }}
              >
                {SCHEMA_TEMPLATES.map((template, index) => (
                  <MenuItem key={index} value={index}>{template.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent={{xs: 'center', md: 'flex-end'}}>
              <Button 
                variant="outlined" 
                startIcon={<Article />}
                onClick={() => setShowExamples(!showExamples)}
              >
                {showExamples ? 'Hide Guide' : 'View Guide'}
              </Button>
              
              <Button 
                variant="contained" 
                startIcon={<PlayArrow />}
                onClick={handleValidate}
                color={isValid === true ? 'success' : isValid === false ? 'error' : 'primary'}
              >
                Validate
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 说明展示区域 */}
      <Collapse in={showExamples}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            JSON Schema Validation Guide
          </Typography>
          <Typography variant="body2" paragraph>
            JSON Schema is a declarative language for validating JSON data. You can define the format,
            required fields, and data types, then validate whether JSON data meets these rules.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Common Schema Keywords Examples:
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">Type Validation</Typography>
                  <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    customStyle={{ borderRadius: 4, marginTop: 8, fontSize: '0.8rem' }}
                  >
{`{
  "type": "string" 
}
// Or
{
  "type": ["string", "number"]
}`}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">Required Fields</Typography>
                  <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    customStyle={{ borderRadius: 4, marginTop: 8, fontSize: '0.8rem' }}
                  >
{`{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" }
  },
  "required": ["name"]
}`}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">Value Range</Typography>
                  <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    customStyle={{ borderRadius: 4, marginTop: 8, fontSize: '0.8rem' }}
                  >
{`{
  "type": "number",
  "minimum": 0,
  "maximum": 100,
  "exclusiveMaximum": true
}`}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* 主内容区域 */}
      <Grid container spacing={3}>
        {/* 左侧：JSON数据 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              JSON Data
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter JSON data..."
                error={isValid === false}
                sx={{ fontFamily: 'monospace' }}
              />
              <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                <Tooltip title="Paste">
                  <IconButton size="small" onClick={() => handlePaste(false)}>
                    <ContentPaste fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={() => handleCopy(input)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {validationError && (
              <FormHelperText error>
                {validationError}
              </FormHelperText>
            )}
          </Paper>
        </Grid>
        
        {/* 右侧：JSON Schema */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              JSON Schema
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={schemaInput}
                onChange={(e) => setSchemaInput(e.target.value)}
                placeholder="Enter JSON Schema..."
                error={isValid === false}
                sx={{ fontFamily: 'monospace' }}
              />
              <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                <Tooltip title="Paste">
                  <IconButton size="small" onClick={() => handlePaste(true)}>
                    <ContentPaste fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={() => handleCopy(schemaInput)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 验证结果区域 */}
      {isValid !== null && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {isValid ? (
              <Chip 
                icon={<Check />} 
                label="Validation Passed" 
                color="success" 
                variant="outlined"
                sx={{ mr: 2 }}
              />
            ) : (
              <Chip 
                icon={<ErrorIcon />} 
                label={`Found ${validationErrors.length} errors`} 
                color="error" 
                variant="outlined"
                sx={{ mr: 2 }}
              />
            )}
            
            {validationErrors.length > 0 && (
              <IconButton
                onClick={() => setShowValidationErrors(!showValidationErrors)}
                size="small"
              >
                {showValidationErrors ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
          
          {validationErrors.length > 0 && (
            <Collapse in={showValidationErrors}>
              <List dense>
                {validationErrors.map((error, index) => (
                  <ListItem 
                    key={index}
                    button
                    selected={selectedErrorPath === error.path}
                    onClick={() => setSelectedErrorPath(error.path)}
                    sx={{ 
                      borderLeft: '2px solid', 
                      borderLeftColor: 'error.main',
                      mb: 1,
                      backgroundColor: selectedErrorPath === error.path ? 'rgba(255, 0, 0, 0.05)' : 'transparent'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Path: {error.path || 'root'}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="error">
                            {getErrorDetails(error)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Error type: {error.keyword}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </Paper>
      )}
    </Box>
  )
} 