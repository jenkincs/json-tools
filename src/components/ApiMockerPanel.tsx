import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  TextField,
  Paper,
  Button,
  IconButton,
  Typography,
  Slider,
  FormControl,
  FormControlLabel,
  InputLabel,
  Switch,
  Select,
  MenuItem,
  Tooltip,
  Chip,
  Alert,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  PlayArrow,
  Save,
  Delete,
  ExpandMore,
  Warning,
  Refresh
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// 导入随机数据生成器和校验工具
import { generateMockData } from '../utils/apiMocker'

// 定义接口类型
interface MockEndpoint {
  id: string
  name: string
  schema: string
  delay: number
  errorRate: number
  statusCodes: {
    success: number
    error: number
  }
  headers: Record<string, string>
  enabled: boolean
}

interface ApiMockerPanelProps {
  onSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void
}

// 服务器链接列表组件
interface ApiLinkProps {
  port: number;
  endpoint: MockEndpoint;
  onPreview: (endpoint: string) => void;
}

const ApiEndpointLink = ({ port, endpoint, onPreview }: ApiLinkProps) => {
  const baseUrl = `http://localhost:${port}/api/`;
  const url = baseUrl + endpoint.name;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography variant="body2" sx={{ mr: 1 }}>
        {endpoint.name}:
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" color="primary" sx={{ mr: 0.5 }}>
          {url}
        </Typography>
        <Tooltip title="查看示例响应">
          <IconButton 
            size="small" 
            onClick={() => onPreview(endpoint.name)}
            color="primary"
          >
            <PlayArrow fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// 示例Schema模板
const schemaExamples = {
  user: {
    type: "object",
    properties: {
      id: { type: "integer" },
      name: { type: "string" },
      email: { type: "string", format: "email" },
      age: { type: "integer", minimum: 18, maximum: 100 },
      isActive: { type: "boolean" },
      registeredAt: { type: "string", format: "date-time" }
    },
    required: ["id", "name", "email"]
  },
  product: {
    type: "object",
    properties: {
      id: { type: "integer" },
      name: { type: "string" },
      price: { type: "number", minimum: 0 },
      description: { type: "string" },
      category: { type: "string" },
      inStock: { type: "boolean" },
      tags: { 
        type: "array", 
        items: { type: "string" }
      },
      rating: { 
        type: "object",
        properties: {
          average: { type: "number", minimum: 0, maximum: 5 },
          count: { type: "integer", minimum: 0 }
        }
      }
    },
    required: ["id", "name", "price"]
  },
  order: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      customer: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string", format: "email" }
        },
        required: ["id", "name"]
      },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            productId: { type: "integer" },
            name: { type: "string" },
            quantity: { type: "integer", minimum: 1 },
            price: { type: "number" }
          },
          required: ["productId", "quantity", "price"]
        },
        minItems: 1
      },
      total: { type: "number" },
      status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] },
      createdAt: { type: "string", format: "date-time" }
    },
    required: ["id", "customer", "items", "total", "status"]
  }
};

export function ApiMockerPanel({ onSnackbar }: ApiMockerPanelProps) {
  const { t } = useTranslation()
  
  // 状态管理
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([])
  const [currentEndpoint, setCurrentEndpoint] = useState<MockEndpoint>({
    id: '',
    name: '',
    schema: '',
    delay: 300,
    errorRate: 0,
    statusCodes: {
      success: 200,
      error: 400
    },
    headers: {
      'Content-Type': 'application/json'
    },
    enabled: true
  })
  const [mockResults, setMockResults] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [serverRunning, setServerRunning] = useState<boolean>(false)
  const [serverPort, setServerPort] = useState<number>(3001)
  
  // 当前模拟服务器的请求处理函数（内存模拟）
  const [mockServerHandler, setMockServerHandler] = useState<any>(null);
  
  // 响应预览对话框状态
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // 初始化 - 从本地存储加载端点配置
  useEffect(() => {
    const savedEndpoints = localStorage.getItem('apiMockerEndpoints')
    if (savedEndpoints) {
      try {
        const parsed = JSON.parse(savedEndpoints)
        setEndpoints(parsed)
        
        // 如果有端点，设置第一个为当前端点
        if (parsed.length > 0) {
          setCurrentEndpoint(parsed[0])
        }
      } catch (err) {
        console.error('Failed to load saved endpoints:', err)
      }
    }
  }, [])
  
  // 当前端点变化时更新表单
  const handleEndpointChange = (id: string) => {
    const endpoint = endpoints.find(e => e.id === id)
    if (endpoint) {
      setCurrentEndpoint(endpoint)
      setValidationError(null)
    }
  }
  
  // 表单字段变化处理
  const handleInputChange = (field: keyof MockEndpoint, value: any) => {
    setCurrentEndpoint(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // 特殊字段处理
  const handleStatusCodeChange = (type: 'success' | 'error', value: number) => {
    setCurrentEndpoint(prev => ({
      ...prev,
      statusCodes: {
        ...prev.statusCodes,
        [type]: value
      }
    }))
  }
  
  // 添加/保存端点
  const handleSaveEndpoint = () => {
    try {
      // 验证必填字段
      if (!currentEndpoint.name.trim()) {
        setValidationError(t('apiMocker.errors.nameRequired'))
        return
      }
      
      // 验证JSON Schema格式
      try {
        JSON.parse(currentEndpoint.schema)
      } catch (err) {
        setValidationError(t('apiMocker.errors.invalidSchema'))
        return
      }
      
      // 检查是新建还是更新
      const isNew = !currentEndpoint.id
      const now = new Date().getTime()
      
      const updatedEndpoint = {
        ...currentEndpoint,
        id: isNew ? `endpoint_${now}` : currentEndpoint.id
      }
      
      let updatedEndpoints
      if (isNew) {
        updatedEndpoints = [...endpoints, updatedEndpoint]
      } else {
        updatedEndpoints = endpoints.map(e => 
          e.id === updatedEndpoint.id ? updatedEndpoint : e
        )
      }
      
      // 更新状态并保存到本地存储
      setEndpoints(updatedEndpoints)
      localStorage.setItem('apiMockerEndpoints', JSON.stringify(updatedEndpoints))
      
      // 触发通知
      onSnackbar(
        isNew 
          ? t('apiMocker.messages.endpointCreated') 
          : t('apiMocker.messages.endpointUpdated'),
        'success'
      )
      
      setValidationError(null)
    } catch (err) {
      setValidationError(t('apiMocker.errors.saveFailed'))
    }
  }
  
  // 删除端点
  const handleDeleteEndpoint = (id: string) => {
    const updatedEndpoints = endpoints.filter(e => e.id !== id)
    setEndpoints(updatedEndpoints)
    localStorage.setItem('apiMockerEndpoints', JSON.stringify(updatedEndpoints))
    
    // 如果删除的是当前端点，重置表单或切换到第一个端点
    if (id === currentEndpoint.id) {
      if (updatedEndpoints.length > 0) {
        setCurrentEndpoint(updatedEndpoints[0])
      } else {
        setCurrentEndpoint({
          id: '',
          name: '',
          schema: '',
          delay: 300,
          errorRate: 0,
          statusCodes: {
            success: 200,
            error: 400
          },
          headers: {
            'Content-Type': 'application/json'
          },
          enabled: true
        })
      }
    }
    
    onSnackbar(t('apiMocker.messages.endpointDeleted'), 'success')
  }
  
  // 创建新端点
  const handleNewEndpoint = () => {
    setCurrentEndpoint({
      id: '',
      name: '',
      schema: '',
      delay: 300,
      errorRate: 0,
      statusCodes: {
        success: 200,
        error: 400
      },
      headers: {
        'Content-Type': 'application/json'
      },
      enabled: true
    })
    setValidationError(null)
    setMockResults('')
  }
  
  // 生成模拟数据
  const handleGenerateMock = async () => {
    try {
      setIsGenerating(true)
      setValidationError(null)
      
      // 验证JSON Schema格式
      const schema = JSON.parse(currentEndpoint.schema)
      
      // 生成随机数据
      const mockData = await generateMockData(
        schema, 
        currentEndpoint.errorRate,
        currentEndpoint.delay
      )
      
      setMockResults(JSON.stringify(mockData, null, 2))
      setIsGenerating(false)
    } catch (err) {
      setValidationError(t('apiMocker.errors.generationFailed'))
      setIsGenerating(false)
      console.error('Failed to generate mock data:', err)
    }
  }
  
  // 复制模拟数据
  const handleCopyMock = () => {
    if (!mockResults) {
      setValidationError(t('apiMocker.errors.noDataToCopy'))
      return
    }
    
    navigator.clipboard.writeText(mockResults)
    onSnackbar(t('apiMocker.messages.dataCopied'), 'success')
  }
  
  // 粘贴JSON Schema
  const handlePasteSchema = async () => {
    try {
      const text = await navigator.clipboard.readText()
      
      // 尝试解析JSON以验证格式
      JSON.parse(text)
      
      handleInputChange('schema', text)
      setValidationError(null)
    } catch (err) {
      setValidationError(t('apiMocker.errors.invalidPastedSchema'))
    }
  }
  
  // 启动/停止模拟服务器
  const handleToggleServer = () => {
    if (!serverRunning) {
      // 启动模拟服务器
      try {
        // 创建一个内存中的模拟处理函数
        const handler = (endpoint: string) => {
          const mockEndpoint = endpoints.find(e => 
            e.enabled && e.name === endpoint
          );
          
          if (!mockEndpoint) {
            return {
              status: 404,
              data: {
                error: "Not Found",
                message: `Endpoint '${endpoint}' does not exist or is disabled`
              }
            };
          }
          
          // 模拟延迟
          const delay = mockEndpoint.delay;
          
          // 模拟错误率
          const shouldError = Math.random() * 100 < mockEndpoint.errorRate;
          
          if (shouldError) {
            // 随机选择一种错误类型
            const errorTypes = [
              {
                status: 400,
                error: "Bad Request",
                message: "The request was malformed or contains invalid parameters"
              },
              {
                status: 401,
                error: "Unauthorized",
                message: "Authentication is required and has failed or has not been provided"
              },
              {
                status: 403,
                error: "Forbidden",
                message: "The server understood the request but refuses to authorize it"
              },
              {
                status: 404,
                error: "Not Found",
                message: "The requested resource could not be found"
              },
              {
                status: 500,
                error: "Internal Server Error",
                message: "The server encountered an unexpected condition that prevented it from fulfilling the request"
              },
              {
                status: 503,
                error: "Service Unavailable",
                message: "The server is currently unavailable"
              }
            ];
            
            const errorResponse = errorTypes[Math.floor(Math.random() * errorTypes.length)];
            
            return {
              status: mockEndpoint.statusCodes.error,
              data: errorResponse,
              delay
            };
          }
          
          try {
            // 生成响应数据
            const schema = JSON.parse(mockEndpoint.schema);
            // 使用简化的伪随机数据生成逻辑
            const generateData = (schema: any): any => {
              if (!schema || typeof schema !== 'object') return schema;
              
              if (schema.type === 'object') {
                const result: Record<string, any> = {};
                if (schema.properties) {
                  for (const [key, propSchema] of Object.entries(schema.properties)) {
                    result[key] = generateData(propSchema as any);
                  }
                }
                return result;
              } else if (schema.type === 'array') {
                const count = Math.floor(Math.random() * 5) + 1; // 1-5 items
                const result = [];
                for (let i = 0; i < count; i++) {
                  result.push(generateData(schema.items));
                }
                return result;
              } else if (schema.type === 'string') {
                if (schema.format === 'email') return `user${Math.floor(Math.random() * 100)}@example.com`;
                if (schema.format === 'date-time') return new Date().toISOString();
                if (schema.format === 'uuid') return `uuid-${Math.random().toString(36).substring(2, 15)}`;
                if (schema.enum) return schema.enum[Math.floor(Math.random() * schema.enum.length)];
                return `String-${Math.random().toString(36).substring(2, 8)}`;
              } else if (schema.type === 'number' || schema.type === 'integer') {
                const min = schema.minimum || 0;
                const max = schema.maximum || 1000;
                const value = Math.random() * (max - min) + min;
                return schema.type === 'integer' ? Math.floor(value) : value;
              } else if (schema.type === 'boolean') {
                return Math.random() > 0.5;
              } else {
                return null;
              }
            };
            
            const mockData = generateData(schema);
            
            return {
              status: mockEndpoint.statusCodes.success,
              data: mockData,
              delay
            };
          } catch (error) {
            return {
              status: 500,
              data: {
                error: "Internal Server Error",
                message: "Failed to generate mock response",
                details: String(error)
              },
              delay: 0
            };
          }
        };
        
        // 存储处理函数
        setMockServerHandler(() => handler);
        setServerRunning(true);
        onSnackbar(t('apiMocker.messages.serverStarted', { port: serverPort }), 'success');
        
        // 添加内嵌iframe的JS代码，用于在页面内模拟API请求
        const script = document.createElement('script');
        script.id = 'api-mocker-script';
        script.innerHTML = `
          window.apiMockerFetch = function(endpoint) {
            return new Promise((resolve) => {
              const event = new CustomEvent('api-mocker-request', { 
                detail: { endpoint, timestamp: Date.now() } 
              });
              window.dispatchEvent(event);
              
              const listener = function(e) {
                if (e.detail.timestamp === event.detail.timestamp) {
                  window.removeEventListener('api-mocker-response', listener);
                  resolve(e.detail.response);
                }
              };
              
              window.addEventListener('api-mocker-response', listener);
            });
          };
        `;
        document.head.appendChild(script);
        
        // 添加事件监听器处理API请求
        const requestHandler = (event: any) => {
          const { endpoint, timestamp } = event.detail;
          const response = handler(endpoint);
          
          // 模拟延迟
          setTimeout(() => {
            const responseEvent = new CustomEvent('api-mocker-response', {
              detail: {
                timestamp,
                response
              }
            });
            window.dispatchEvent(responseEvent);
          }, response.delay || 0);
        };
        
        window.addEventListener('api-mocker-request', requestHandler);
        
        // 保存引用以便清理
        (window as any).apiMockerCleanup = () => {
          window.removeEventListener('api-mocker-request', requestHandler);
          const scriptElement = document.getElementById('api-mocker-script');
          if (scriptElement) {
            scriptElement.remove();
          }
        };
      } catch (error) {
        onSnackbar(t('apiMocker.errors.serverStartFailed'), 'error');
        console.error('Mock server start failed:', error);
      }
    } else {
      // 停止模拟服务器
      setServerRunning(false);
      setMockServerHandler(null);
      onSnackbar(t('apiMocker.messages.serverStopped'), 'info');
      
      // 清理事件监听器和脚本
      if ((window as any).apiMockerCleanup) {
        (window as any).apiMockerCleanup();
        delete (window as any).apiMockerCleanup;
      }
    }
  }
  
  // 添加加载示例Schema的函数
  const handleLoadSchemaExample = (exampleKey: keyof typeof schemaExamples) => {
    try {
      const schema = schemaExamples[exampleKey];
      setCurrentEndpoint(prev => ({
        ...prev,
        schema: JSON.stringify(schema, null, 2),
        name: prev.name || exampleKey
      }));
      
      setValidationError(null);
      
      onSnackbar(
        t('apiMocker.messages.schemaExampleLoaded', { name: t(`apiMocker.examples.${exampleKey}`) }),
        'success'
      );
    } catch (err) {
      setValidationError(t('apiMocker.errors.loadExampleFailed'));
    }
  };
  
  // 预览API响应
  const handlePreviewEndpoint = async (endpointName: string) => {
    if (!mockServerHandler) return;
    
    setPreviewLoading(true);
    setPreviewOpen(true);
    
    try {
      // 使用内存模拟处理程序获取数据
      const response = mockServerHandler(endpointName);
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, response.delay || 0));
      
      setPreviewData(response);
    } catch (error) {
      setPreviewData({
        status: 500,
        data: {
          error: "Internal Error",
          message: "Failed to generate preview",
          details: String(error)
        }
      });
    } finally {
      setPreviewLoading(false);
    }
  };
  
  // 关闭预览对话框
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewData(null);
  };
  
  // 渲染端点列表项
  const renderEndpointItem = (endpoint: MockEndpoint) => (
    <MenuItem 
      key={endpoint.id} 
      value={endpoint.id}
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <span>
        {endpoint.name}
        {!endpoint.enabled && (
          <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
            ({t('apiMocker.labels.disabled')})
          </Typography>
        )}
      </span>
      <IconButton 
        size="small" 
        color="error" 
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteEndpoint(endpoint.id)
        }}
      >
        <Delete fontSize="small" />
      </IconButton>
    </MenuItem>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('apiMocker.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('apiMocker.description')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {['API Mocking', 'JSON Schema', 'Mock Data', 'API Testing', 'Frontend Development', 'Fake API', 'Backend Simulation'].map((keyword) => (
            <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={2}>
        {/* Control Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                {t('apiMocker.labels.endpoints')}
              </Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<Refresh />}
                  onClick={handleNewEndpoint}
                >
                  {t('apiMocker.buttons.newEndpoint')}
                </Button>
              </Box>
            </Box>
            
            {endpoints.length > 0 ? (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>{t('apiMocker.labels.selectEndpoint')}</InputLabel>
                <Select
                  value={currentEndpoint.id || ''}
                  label={t('apiMocker.labels.selectEndpoint')}
                  onChange={(e) => handleEndpointChange(e.target.value)}
                  renderValue={(selected) => {
                    const endpoint = endpoints.find(e => e.id === selected)
                    return endpoint ? endpoint.name : ''
                  }}
                  displayEmpty
                >
                  {endpoints.map(renderEndpointItem)}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('apiMocker.messages.noEndpoints')}
              </Alert>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Endpoint Configuration */}
            <Typography variant="subtitle1" gutterBottom>
              {currentEndpoint.id ? 
                t('apiMocker.labels.editEndpoint') : 
                t('apiMocker.labels.createEndpoint')
              }
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t('apiMocker.labels.endpointName')}
                value={currentEndpoint.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={currentEndpoint.enabled}
                    onChange={(e) => handleInputChange('enabled', e.target.checked)}
                  />
                }
                label={t('apiMocker.labels.enabled')}
              />
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{t('apiMocker.labels.responseSettings')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" gutterBottom>
                    {t('apiMocker.labels.delay')} ({currentEndpoint.delay}ms)
                  </Typography>
                  <Slider
                    value={currentEndpoint.delay}
                    onChange={(_, value) => handleInputChange('delay', value)}
                    min={0}
                    max={5000}
                    step={50}
                    valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                  />
                  
                  <Typography variant="body2" gutterBottom>
                    {t('apiMocker.labels.errorRate')} ({currentEndpoint.errorRate}%)
                  </Typography>
                  <Slider
                    value={currentEndpoint.errorRate}
                    onChange={(_, value) => handleInputChange('errorRate', value)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label={t('apiMocker.labels.successStatus')}
                        value={currentEndpoint.statusCodes.success}
                        onChange={(e) => handleStatusCodeChange('success', Number(e.target.value))}
                        type="number"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label={t('apiMocker.labels.errorStatus')}
                        value={currentEndpoint.statusCodes.error}
                        onChange={(e) => handleStatusCodeChange('error', Number(e.target.value))}
                        type="number"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveEndpoint}
                >
                  {t('apiMocker.buttons.saveEndpoint')}
                </Button>
                
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PlayArrow />}
                  onClick={handleGenerateMock}
                  disabled={!currentEndpoint.schema || isGenerating}
                >
                  {isGenerating ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    t('apiMocker.buttons.generateMock')
                  )}
                </Button>
              </Box>
              
              {validationError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {validationError}
                </Alert>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Server Controls */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('apiMocker.labels.mockServer')}
              </Typography>
              
              <TextField
                fullWidth
                label={t('apiMocker.labels.serverPort')}
                value={serverPort}
                onChange={(e) => setServerPort(Number(e.target.value))}
                type="number"
                size="small"
                sx={{ mb: 2 }}
                disabled={serverRunning}
              />
              
              <Button
                variant={serverRunning ? "outlined" : "contained"}
                color={serverRunning ? "error" : "success"}
                startIcon={serverRunning ? <Warning /> : <PlayArrow />}
                onClick={handleToggleServer}
                fullWidth
              >
                {serverRunning ? 
                  t('apiMocker.buttons.stopServer') : 
                  t('apiMocker.buttons.startServer')
                }
              </Button>
              
              {serverRunning && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {t('apiMocker.messages.serverRunning', { port: serverPort })}
                  </Alert>
                  
                  <Paper variant="outlined" sx={{ p: 2, mt: 2, maxHeight: '200px', overflow: 'auto' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('apiMocker.labels.availableEndpoints')}:
                    </Typography>
                    
                    {endpoints.filter(e => e.enabled).length > 0 ? (
                      endpoints.filter(e => e.enabled).map(endpoint => (
                        <ApiEndpointLink 
                          key={endpoint.id} 
                          port={serverPort} 
                          endpoint={endpoint}
                          onPreview={handlePreviewEndpoint}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('apiMocker.messages.noEnabledEndpoints')}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* JSON Schema & Mock Result */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* JSON Schema Input */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">
                    {t('apiMocker.labels.jsonSchema')}
                  </Typography>
                  <IconButton onClick={handlePasteSchema} size="small">
                    <ContentPaste />
                  </IconButton>
                </Box>
                
                {/* Schema示例模板按钮 */}
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" sx={{ width: '100%', mb: 1 }}>
                    {t('apiMocker.labels.schemaExamples')}:
                  </Typography>
                  
                  <Button 
                    size="small"
                    variant="outlined"
                    onClick={() => handleLoadSchemaExample('user')}
                  >
                    {t('apiMocker.examples.user')}
                  </Button>
                  
                  <Button 
                    size="small"
                    variant="outlined"
                    onClick={() => handleLoadSchemaExample('product')}
                  >
                    {t('apiMocker.examples.product')}
                  </Button>
                  
                  <Button 
                    size="small"
                    variant="outlined"
                    onClick={() => handleLoadSchemaExample('order')}
                  >
                    {t('apiMocker.examples.order')}
                  </Button>
                </Box>
                
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  value={currentEndpoint.schema}
                  onChange={(e) => handleInputChange('schema', e.target.value)}
                  placeholder={t('apiMocker.placeholders.enterSchema')}
                  InputProps={{
                    sx: { fontFamily: 'monospace' }
                  }}
                />
              </Paper>
            </Grid>
            
            {/* Mock Result Output */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">
                    {t('apiMocker.labels.mockResult')}
                  </Typography>
                  <IconButton 
                    onClick={handleCopyMock} 
                    size="small"
                    disabled={!mockResults}
                  >
                    <ContentCopy />
                  </IconButton>
                </Box>
                
                {mockResults ? (
                  <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                    >
                      {mockResults}
                    </SyntaxHighlighter>
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      height: '200px', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <Typography color="text.secondary">
                      {t('apiMocker.messages.noMockData')}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      {/* API响应预览对话框 */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('apiMocker.labels.responsePreview')}
        </DialogTitle>
        <DialogContent>
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : previewData ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('apiMocker.labels.statusCode')}: 
                <Chip 
                  size="small" 
                  label={previewData.status}
                  color={previewData.status >= 200 && previewData.status < 300 ? "success" : "error"}
                  sx={{ ml: 1 }}
                />
              </Typography>
              
              <Box sx={{ mt: 2, maxHeight: '400px', overflow: 'auto' }}>
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                >
                  {JSON.stringify(previewData.data, null, 2)}
                </SyntaxHighlighter>
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary">
              {t('apiMocker.messages.noPreviewData')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>
            {t('common.close')}
          </Button>
          {previewData && (
            <Button 
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(previewData.data, null, 2));
                onSnackbar(t('apiMocker.messages.dataCopied'), 'success');
              }}
              startIcon={<ContentCopy />}
            >
              {t('apiMocker.buttons.copyMock')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
} 