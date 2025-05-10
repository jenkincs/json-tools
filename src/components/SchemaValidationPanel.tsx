import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
    id: 'genericObject',
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
    id: 'userList',
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
    id: 'configObject',
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
    id: 'genericObject',
    data: {
      name: "John Doe",
      age: 30,
      email: "john.doe@example.com"
    }
  },
  {
    id: 'userList',
    data: [
      { id: 1, name: "John", email: "john@example.com", active: true },
      { id: 2, name: "Jane", email: "jane@example.com", active: false }
    ]
  },
  {
    id: 'configObject',
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
  const { t } = useTranslation();
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
    if (SCHEMA_TEMPLATES[index].id === DATA_EXAMPLES[index].id) {
      setInput(JSON.stringify(DATA_EXAMPLES[index].data, null, 2));
      setSelectedDataExample(index);
      onSnackbar(t('validate.templateDataLoaded', { name: t(`validate.templateExamples.${SCHEMA_TEMPLATES[index].id}`) }));
    } else {
      onSnackbar(t('validate.templateLoaded'));
    }
  }
  
  // Load example data
  const handleLoadExample = (index: number) => {
    setInput(JSON.stringify(DATA_EXAMPLES[index].data, null, 2));
    setSelectedDataExample(index);
    
    // Automatically load corresponding schema template
    if (DATA_EXAMPLES[index].id === SCHEMA_TEMPLATES[index].id) {
      setSchemaInput(JSON.stringify(SCHEMA_TEMPLATES[index].schema, null, 2));
      setSelectedSchemaTemplate(index);
      onSnackbar(t('validate.dataTemplateLoaded', { name: t(`validate.templateExamples.${DATA_EXAMPLES[index].id}`) }));
    } else {
      onSnackbar(t('validate.dataLoaded'));
    }
  }

  // Validation logic
  const handleValidate = () => {
    try {
      if (!input.trim() || !schemaInput.trim()) {
        setValidationError(t('validate.enterBoth'));
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
        onSnackbar(t('validate.jsonValid'));
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
            message: error.message || t('validate.invalidValue'),
            keyword: error.keyword,
            params: error.params,
            data: dataValue
          };
        }) || [];
        
        setValidationErrors(errors as ValidationErrorDetails[])
        setValidationError(t('validate.jsonInvalid'));
        setIsValid(false)
        setShowValidationErrors(true)
      }
    } catch (err: any) {
      setValidationError(`${t('common.error.invalidJson')}: ${err.message || t('validate.invalidFormat')}`);
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
      setValidationError(t('common.error.clipboard'))
    }
  }
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    onSnackbar(t('common.copied', { content: t('validate.validationResult') }));
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('validate.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('validate.description')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {t('validate.keywords', { returnObjects: true }).map((keyword: string) => (
            <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('validate.jsonData')}
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel>{t('validate.dataExamples')}</InputLabel>
                  <Select
                    value={selectedDataExample}
                    label={t('validate.dataExamples')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value !== '') {
                        handleLoadExample(value as number);
                      }
                    }}
                  >
                    <MenuItem value="">{t('validate.selectExample')}</MenuItem>
                    {DATA_EXAMPLES.map((example, index) => (
                      <MenuItem key={index} value={index}>
                        {t(`validate.templateExamples.${example.id}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('validate.enterJsonData')}
                  error={!!validationError}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title={t('format.paste')}>
                    <IconButton 
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText()
                          setInput(text)
                        } catch (err) {
                          onSnackbar(t('common.error.clipboard'))
                        }
                      }}
                    >
                      <ContentPaste />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('validate.jsonSchema')}
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel>{t('validate.schemaTemplates')}</InputLabel>
                  <Select
                    value={selectedSchemaTemplate}
                    label={t('validate.schemaTemplates')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value !== '') {
                        handleLoadTemplate(value as number);
                      }
                    }}
                  >
                    <MenuItem value="">{t('validate.selectTemplate')}</MenuItem>
                    {SCHEMA_TEMPLATES.map((template, index) => (
                      <MenuItem key={index} value={index}>
                        {t(`validate.templateExamples.${template.id}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  value={schemaInput}
                  onChange={(e) => setSchemaInput(e.target.value)}
                  placeholder={t('validate.enterJsonSchema')}
                  error={!!validationError}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title={t('format.paste')}>
                    <IconButton 
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText()
                          setSchemaInput(text)
                        } catch (err) {
                          onSnackbar(t('common.error.clipboard'))
                        }
                      }}
                    >
                      <ContentPaste />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleValidate}
          startIcon={<PlayArrow />}
          disabled={!input.trim() || !schemaInput.trim()}
          sx={{ minWidth: 150 }}
        >
          {t('validate.validate')}
        </Button>
      </Box>
      
      {isValid !== null && (
        <Paper sx={{ p: 2, borderLeft: 5, borderColor: isValid ? 'success.main' : 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {isValid ? (
              <Check color="success" sx={{ mr: 1 }} />
            ) : (
              <ErrorIcon color="error" sx={{ mr: 1 }} />
            )}
            <Typography 
              variant="subtitle1" 
              color={isValid ? 'success.main' : 'error.main'}
              sx={{ fontWeight: 'bold' }}
            >
              {isValid ? t('validate.validResult') : t('validate.invalidResult')}
            </Typography>
            <IconButton 
              size="small" 
              sx={{ ml: 'auto' }} 
              onClick={() => handleCopy(JSON.stringify(validationErrors, null, 2))}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
          
          {!isValid && validationErrors.length > 0 && (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {t('validate.errorsFound', { count: validationErrors.length })}
              </Typography>
              
              <List sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {validationErrors.map((error, index) => (
                  <ListItem 
                    key={index}
                    divider={index < validationErrors.length - 1}
                    button
                    onClick={() => {
                      setSelectedErrorPath(selectedErrorPath === error.path ? null : error.path)
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {t('validate.atPath')} <code>{error.path}</code>
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="error" component="span">
                          {error.message}
                        </Typography>
                      }
                    />
                    {selectedErrorPath === error.path ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                ))}
              </List>
              
              {/* Error Details Expansion */}
              {validationErrors.map((error, index) => (
                <Collapse key={index} in={selectedErrorPath === error.path} timeout="auto">
                  <Card variant="outlined" sx={{ mt: 1, mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('validate.errorDetails')}
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t('validate.errorType')}
                          </Typography>
                          <Typography variant="body2">
                            {error.keyword}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t('validate.path')}
                          </Typography>
                          <Typography variant="body2">
                            <code>{error.path}</code>
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t('validate.message')}
                          </Typography>
                          <Typography variant="body2">
                            {error.message}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t('validate.receivedValue')}
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                            {typeof error.data === 'object' 
                              ? JSON.stringify(error.data)
                              : String(error.data)
                            }
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t('validate.expectedSchema')}
                          </Typography>
                          <Typography variant="body2">
                            {error.params && JSON.stringify(error.params)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Collapse>
              ))}
            </>
          )}
        </Paper>
      )}
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('validate.learnJsonSchema')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('validate.schemaDescription')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                size="small" 
                component="a" 
                href="https://json-schema.org/understanding-json-schema/index.html" 
                target="_blank"
                startIcon={<Article />}
              >
                {t('validate.documentation')}
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                component="a" 
                href="https://json-schema.org/learn/getting-started-step-by-step.html" 
                target="_blank"
                startIcon={<FormatListBulleted />}
              >
                {t('validate.tutorial')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
} 