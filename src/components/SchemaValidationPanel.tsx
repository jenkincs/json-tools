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

// Schema 模板
const SCHEMA_TEMPLATES = [
  {
    name: '通用对象',
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
    name: '用户列表',
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
    name: '配置对象',
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

// 示例数据
const DATA_EXAMPLES = [
  {
    name: '通用对象',
    data: {
      name: "John Doe",
      age: 30,
      email: "john.doe@example.com"
    }
  },
  {
    name: '用户列表',
    data: [
      { id: 1, name: "John", email: "john@example.com", active: true },
      { id: 2, name: "Jane", email: "jane@example.com", active: false }
    ]
  },
  {
    name: '配置对象',
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
  
  // 加载模板
  const handleLoadTemplate = (index: number) => {
    setSchemaInput(JSON.stringify(SCHEMA_TEMPLATES[index].schema, null, 2));
    setSelectedSchemaTemplate(index);
    
    // 自动加载对应的示例数据
    if (SCHEMA_TEMPLATES[index].name === DATA_EXAMPLES[index].name) {
      setInput(JSON.stringify(DATA_EXAMPLES[index].data, null, 2));
      setSelectedDataExample(index);
      onSnackbar(`已加载 Schema 模板和匹配的示例数据: ${SCHEMA_TEMPLATES[index].name}`);
    } else {
      onSnackbar('Schema template loaded');
    }
  }
  
  // 加载示例数据
  const handleLoadExample = (index: number) => {
    setInput(JSON.stringify(DATA_EXAMPLES[index].data, null, 2));
    setSelectedDataExample(index);
    
    // 自动加载对应的 Schema 模板
    if (DATA_EXAMPLES[index].name === SCHEMA_TEMPLATES[index].name) {
      setSchemaInput(JSON.stringify(SCHEMA_TEMPLATES[index].schema, null, 2));
      setSelectedSchemaTemplate(index);
      onSnackbar(`已加载示例数据和匹配的 Schema 模板: ${DATA_EXAMPLES[index].name}`);
    } else {
      onSnackbar('Example data loaded');
    }
  }

  // 验证逻辑
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
      addFormats(ajv) // 添加email, date等格式验证
      
      const validate = ajv.compile(schema)
      const valid = validate(jsonData)

      if (valid) {
        setValidationErrors([])
        setValidationError(null)
        setIsValid(true)
        onSnackbar('JSON is valid according to the schema!', 'success')
      } else {
        // 更详细的错误信息
        const errors = validate.errors?.map(error => {
          // 根据错误路径获取实际数据值
          let dataValue;
          if (error.instancePath) {
            try {
              // 从JSON数据中提取出对应路径的实际值
              const path = error.instancePath.split('/').filter(p => p);
              let current = jsonData;
              for (const segment of path) {
                current = current[segment];
              }
              dataValue = current;
            } catch (e) {
              // 如果路径解析出错，使用错误对象提供的数据
              dataValue = error.data;
            }
          } else {
            // 如果没有路径，可能是根对象或其他
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
  
  // 获取错误详情的辅助函数
  const getErrorDetails = (error: ValidationErrorDetails) => {
    switch (error.keyword) {
      case 'type': {
        // 直接获取实际值
        const actualValue = error.data;
        
        // 确定实际类型
        let actualType;
        if (actualValue === undefined) {
          // 特殊处理undefined情况，这可能是由于数据访问路径问题
          actualType = 'undefined';
        } else if (actualValue === null) {
          actualType = 'null';
        } else if (Array.isArray(actualValue)) {
          actualType = 'array';
        } else {
          actualType = typeof actualValue;
        }
        
        // 创建值的表示
        let displayValue = '';
        if (actualValue !== undefined) {
          try {
            const valueStr = JSON.stringify(actualValue);
            if (valueStr && valueStr.length < 50) {
              displayValue = ` (值: ${valueStr})`;
            }
          } catch (e) {
            // 忽略序列化错误
          }
        }
        
        return `Expected type '${error.params.type}', got '${actualType}'${displayValue}`;
      }
      
      case 'required':
        return `Missing required property: '${error.params.missingProperty}'`;
      
      case 'enum': {
        // 处理枚举类型错误
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
        // 格式错误
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
        // 最小值错误
        try {
          return `Value ${error.data} must be >= ${error.params.limit}`;
        } catch (e) {
          return `Value must be >= ${error.params.limit}`;
        }
      }
      
      case 'maximum': {
        // 最大值错误
        try {
          return `Value ${error.data} must be <= ${error.params.limit}`;
        } catch (e) {
          return `Value must be <= ${error.params.limit}`;
        }
      }
      
      case 'minLength': {
        // 最小长度错误
        try {
          const strValue = String(error.data || '');
          return `String '${strValue.length > 20 ? strValue.substring(0, 17) + '...' : strValue}' length (${strValue.length}) must be >= ${error.params.limit}`;
        } catch (e) {
          return `String length must be >= ${error.params.limit}`;
        }
      }
      
      case 'maxLength': {
        // 最大长度错误
        try {
          const strValue = String(error.data || '');
          return `String length (${strValue.length}) must be <= ${error.params.limit}`;
        } catch (e) {
          return `String length must be <= ${error.params.limit}`;
        }
      }
      
      case 'pattern': {
        // 模式匹配错误
        try {
          const strValue = String(error.data || '');
          return `String '${strValue.length > 15 ? strValue.substring(0, 12) + '...' : strValue}' must match pattern: ${error.params.pattern}`;
        } catch (e) {
          return `String must match pattern: ${error.params.pattern}`;
        }
      }
      
      default:
        // 默认情况返回原始错误信息
        return error.message || 'Unknown validation error';
    }
  }
  
  // 突出显示有错误的数据部分
  const highlightDataWithError = () => {
    if (!selectedErrorPath || !input) return input;
    
    try {
      const jsonData = JSON.parse(input);
      
      // 辅助函数：显示带有高亮的JSON字符串
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
              <InputLabel>加载示例数据</InputLabel>
              <Select
                value={selectedDataExample}
                label="加载示例数据"
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
              <InputLabel>加载 Schema 模板</InputLabel>
              <Select
                value={selectedSchemaTemplate}
                label="加载 Schema 模板"
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
                {showExamples ? '隐藏说明' : '查看说明'}
              </Button>
              
              <Button 
                variant="contained" 
                startIcon={<PlayArrow />}
                onClick={handleValidate}
                color={isValid === true ? 'success' : isValid === false ? 'error' : 'primary'}
              >
                验证
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 说明展示区域 */}
      <Collapse in={showExamples}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            JSON Schema 验证说明
          </Typography>
          <Typography variant="body2" paragraph>
            JSON Schema 是一种验证 JSON 数据结构的声明式语言。您可以定义数据应该具有的格式、
            必填字段、数据类型等，然后验证 JSON 数据是否符合这些规则。
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            常用 Schema 关键字示例：
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">类型验证</Typography>
                  <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    customStyle={{ borderRadius: 4, marginTop: 8, fontSize: '0.8rem' }}
                  >
{`{
  "type": "string" 
}
// 或
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
                  <Typography variant="subtitle2">必填字段</Typography>
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
                  <Typography variant="subtitle2">数值范围</Typography>
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
              JSON 数据
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
                <Tooltip title="粘贴">
                  <IconButton size="small" onClick={() => handlePaste(false)}>
                    <ContentPaste fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="复制">
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
                <Tooltip title="粘贴">
                  <IconButton size="small" onClick={() => handlePaste(true)}>
                    <ContentPaste fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="复制">
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
                label="验证通过" 
                color="success" 
                variant="outlined"
                sx={{ mr: 2 }}
              />
            ) : (
              <Chip 
                icon={<ErrorIcon />} 
                label={`发现 ${validationErrors.length} 个错误`} 
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
                          位置: {error.path || 'root'}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="error">
                            {getErrorDetails(error)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            错误类型: {error.keyword}
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