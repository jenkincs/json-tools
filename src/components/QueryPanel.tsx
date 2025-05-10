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
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Collapse,
  Chip,
  Stack
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  Search,
  History,
  Info,
  ExpandMore,
  ExpandLess,
  PlayArrow
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { COMMON_JSONPATH_EXAMPLES, TEST_DATA, QUERY_EXAMPLES } from '../constants'
import { QueryHistory, QueryResult } from '../types'

interface QueryPanelProps {
  onSnackbar: (message: string) => void
}

export function QueryPanel({ onSnackbar }: QueryPanelProps) {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [queryResults, setQueryResults] = useState<QueryResult[]>([])
  const [queryError, setQueryError] = useState<string | null>(null)
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([])
  const [showGuide, setShowGuide] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const handleQuery = () => {
    try {
      if (!input.trim() || !query.trim()) {
        setQueryError('Please enter both JSON data and query')
        return
      }

      const jsonData = JSON.parse(input)
      const results: QueryResult[] = []
      
      // Improved JSONPath implementation
      const evaluateQuery = (data: any, path: string) => {
        // Simple case for root object
        if (path === '$') {
          results.push({
            path,
            value: data,
            type: typeof data
          })
          return
        }

        if (path.startsWith('$.')) {
          // Handle simple dot notation paths
          if (!path.includes('[') && !path.includes('*')) {
            const parts = path.slice(2).split('.')
            let current = data
            let currentPath = '$'
            
            for (const part of parts) {
              if (current === undefined) break
              current = current[part]
              currentPath += `.${part}`
            }
            
            if (current !== undefined) {
              results.push({
                path: currentPath,
                value: current,
                type: typeof current
              })
            }
            return
          }
          
          // Handle array access with [*] wildcard
          if (path.includes('[*]')) {
            const basePath = path.split('[*]')[0].slice(2)
            const remainingPath = path.split('[*]').slice(1).join('[*]')
            
            let base = data
            for (const part of basePath.split('.')) {
              if (!part) continue
              base = base[part]
              if (!base) return
            }
            
            if (Array.isArray(base)) {
              // If it's a simple array element access
              if (!remainingPath) {
                base.forEach((item, index) => {
                  results.push({
                    path: `$${basePath ? '.' + basePath : ''}[${index}]`,
                    value: item,
                    type: typeof item
                  })
                })
                return
              }
              
              // If there's a path after the wildcard
              if (remainingPath.startsWith('.')) {
                const propertyPath = remainingPath.slice(1)
                base.forEach((item, index) => {
                  if (item && typeof item === 'object') {
                    let propertyValue = item
                    let valid = true
                    
                    for (const prop of propertyPath.split('.')) {
                      propertyValue = propertyValue[prop]
                      if (propertyValue === undefined) {
                        valid = false
                        break
                      }
                    }
                    
                    if (valid) {
                      results.push({
                        path: `$${basePath ? '.' + basePath : ''}[${index}].${propertyPath}`,
                        value: propertyValue,
                        type: typeof propertyValue
                      })
                    }
                  }
                })
                return
              }
            }
          }
          
          // Handle specific array indices
          if (path.match(/\[\d+\]/) && !path.includes('*')) {
            let parts = path.slice(2)
            let current = data
            let currentPath = '$'
            
            const regex = /(.+?)?(\[\d+\])/g
            let match
            let remainder = parts
            
            while ((match = regex.exec(parts)) !== null) {
              const propPath = match[1]
              const arrayAccess = match[2]
              const index = parseInt(arrayAccess.slice(1, -1))
              
              if (propPath) {
                for (const part of propPath.split('.')) {
                  if (!part) continue
                  current = current[part]
                  currentPath += `.${part}`
                  if (current === undefined) break
                }
              }
              
              if (Array.isArray(current) && current.length > index) {
                current = current[index]
                currentPath += `[${index}]`
              } else {
                current = undefined
                break
              }
              
              remainder = parts.slice(match[0].length)
            }
            
            // Process any remaining path segments after array access
            if (current !== undefined && remainder) {
              if (remainder.startsWith('.')) {
                const props = remainder.slice(1).split('.')
                for (const prop of props) {
                  if (!prop) continue
                  current = current[prop]
                  currentPath += `.${prop}`
                  if (current === undefined) break
                }
              }
            }
            
            if (current !== undefined) {
              results.push({
                path: currentPath,
                value: current,
                type: typeof current
              })
            }
            return
          }
          
          // Handle simple filter conditions for inStock and price
          const filterRegex = /\$\.(.+?)\[\?\(@\.(.+?)(==|<|>|!=)(.+?)\)\]/
          const match = path.match(filterRegex)
          
          if (match) {
            const basePath = match[1]
            const property = match[2]
            const operator = match[3]
            let value = match[4]
            
            // Convert string value to appropriate type
            if (value === 'true') value = true
            else if (value === 'false') value = false
            else if (!isNaN(Number(value))) value = Number(value)
            else value = value.replace(/"/g, '').replace(/'/g, '')
            
            let base = data
            for (const part of basePath.split('.')) {
              if (!part) continue
              base = base[part]
              if (!base) return
            }
            
            if (Array.isArray(base)) {
              base.forEach((item, index) => {
                let matches = false
                
                if (item && typeof item === 'object' && property in item) {
                  const propValue = item[property]
                  
                  switch (operator) {
                    case '==':
                      matches = propValue == value
                      break
                    case '!=':
                      matches = propValue != value
                      break
                    case '>':
                      matches = propValue > value
                      break
                    case '<':
                      matches = propValue < value
                      break
                  }
                  
                  if (matches) {
                    results.push({
                      path: `$.${basePath}[${index}]`,
                      value: item,
                      type: typeof item
                    })
                  }
                }
              })
            }
            return
          }
        }
      }

      evaluateQuery(jsonData, query)
      
      if (results.length === 0) {
        setQueryError('No results found')
      } else {
        setQueryResults(results)
        setQueryError(null)
        
        // Add to history
        setQueryHistory(prev => [{
          query,
          timestamp: Date.now(),
          resultCount: results.length
        }, ...prev].slice(0, 10))
      }
    } catch (err) {
      setQueryError('Invalid JSON or query format')
      setQueryResults([])
    }
  }

  const handlePaste = async (isQuery: boolean) => {
    try {
      const text = await navigator.clipboard.readText()
      if (isQuery) {
        setQuery(text)
      } else {
        setInput(text)
      }
    } catch (err) {
      setQueryError('Failed to read from clipboard')
    }
  }

  const handleExampleClick = (path: string) => {
    // 设置查询字符串
    setQuery(path);
    
    // 确保测试数据已加载
    const inputData = input.trim() ? input : JSON.stringify(TEST_DATA, null, 2);
    
    try {
      // 直接执行查询逻辑而不依赖于状态更新
      const jsonData = JSON.parse(inputData);
      const results: QueryResult[] = [];
      
      // 使用与handleQuery相同的查询逻辑
      // 调用evaluateQuery函数
      const evaluateQuery = (data: any, queryPath: string) => {
        // Simple case for root object
        if (queryPath === '$') {
          results.push({
            path: queryPath,
            value: data,
            type: typeof data
          });
          return;
        }

        if (queryPath.startsWith('$.')) {
          // Handle simple dot notation paths
          if (!queryPath.includes('[') && !queryPath.includes('*')) {
            const parts = queryPath.slice(2).split('.');
            let current = data;
            let currentPath = '$';
            
            for (const part of parts) {
              if (current === undefined) break;
              current = current[part];
              currentPath += `.${part}`;
            }
            
            if (current !== undefined) {
              results.push({
                path: currentPath,
                value: current,
                type: typeof current
              });
            }
            return;
          }
          
          // Handle array access with [*] wildcard
          if (queryPath.includes('[*]')) {
            const basePath = queryPath.split('[*]')[0].slice(2);
            const remainingPath = queryPath.split('[*]').slice(1).join('[*]');
            
            let base = data;
            for (const part of basePath.split('.')) {
              if (!part) continue;
              base = base[part];
              if (!base) return;
            }
            
            if (Array.isArray(base)) {
              // If it's a simple array element access
              if (!remainingPath) {
                base.forEach((item, index) => {
                  results.push({
                    path: `$${basePath ? '.' + basePath : ''}[${index}]`,
                    value: item,
                    type: typeof item
                  });
                });
                return;
              }
              
              // If there's a path after the wildcard
              if (remainingPath.startsWith('.')) {
                const propertyPath = remainingPath.slice(1);
                base.forEach((item, index) => {
                  if (item && typeof item === 'object') {
                    let propertyValue = item;
                    let valid = true;
                    
                    for (const prop of propertyPath.split('.')) {
                      propertyValue = propertyValue[prop];
                      if (propertyValue === undefined) {
                        valid = false;
                        break;
                      }
                    }
                    
                    if (valid) {
                      results.push({
                        path: `$${basePath ? '.' + basePath : ''}[${index}].${propertyPath}`,
                        value: propertyValue,
                        type: typeof propertyValue
                      });
                    }
                  }
                });
                return;
              }
            }
          }
          
          // Handle specific array indices
          if (queryPath.match(/\[\d+\]/) && !queryPath.includes('*')) {
            let parts = queryPath.slice(2);
            let current = data;
            let currentPath = '$';
            
            const regex = /(.+?)?(\[\d+\])/g;
            let match;
            let remainder = parts;
            
            while ((match = regex.exec(parts)) !== null) {
              const propPath = match[1];
              const arrayAccess = match[2];
              const index = parseInt(arrayAccess.slice(1, -1));
              
              if (propPath) {
                for (const part of propPath.split('.')) {
                  if (!part) continue;
                  current = current[part];
                  currentPath += `.${part}`;
                  if (current === undefined) break;
                }
              }
              
              if (Array.isArray(current) && current.length > index) {
                current = current[index];
                currentPath += `[${index}]`;
              } else {
                current = undefined;
                break;
              }
              
              remainder = parts.slice(match[0].length);
            }
            
            // Process any remaining path segments after array access
            if (current !== undefined && remainder) {
              if (remainder.startsWith('.')) {
                const props = remainder.slice(1).split('.');
                for (const prop of props) {
                  if (!prop) continue;
                  current = current[prop];
                  currentPath += `.${prop}`;
                  if (current === undefined) break;
                }
              }
            }
            
            if (current !== undefined) {
              results.push({
                path: currentPath,
                value: current,
                type: typeof current
              });
            }
            return;
          }
          
          // Handle simple filter conditions for inStock and price
          const filterRegex = /\$\.(.+?)\[\?\(@\.(.+?)(==|<|>|!=)(.+?)\)\]/;
          const match = queryPath.match(filterRegex);
          
          if (match) {
            const basePath = match[1];
            const property = match[2];
            const operator = match[3];
            let value = match[4];
            
            // Convert string value to appropriate type
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(Number(value))) value = Number(value);
            else value = value.replace(/"/g, '').replace(/'/g, '');
            
            let base = data;
            for (const part of basePath.split('.')) {
              if (!part) continue;
              base = base[part];
              if (!base) return;
            }
            
            if (Array.isArray(base)) {
              base.forEach((item, index) => {
                let matches = false;
                
                if (item && typeof item === 'object' && property in item) {
                  const propValue = item[property];
                  
                  switch (operator) {
                    case '==':
                      matches = propValue == value;
                      break;
                    case '!=':
                      matches = propValue != value;
                      break;
                    case '>':
                      matches = propValue > value;
                      break;
                    case '<':
                      matches = propValue < value;
                      break;
                  }
                  
                  if (matches) {
                    results.push({
                      path: `$.${basePath}[${index}]`,
                      value: item,
                      type: typeof item
                    });
                  }
                }
              });
            }
            return;
          }
        }
      };
      
      evaluateQuery(jsonData, path);
      
      if (results.length === 0) {
        setQueryError('No results found');
        setQueryResults([]);
      } else {
        // 更新状态
        setQueryResults(results);
        setQueryError(null);
        
        // 如果需要，更新输入框
        if (!input.trim()) {
          setInput(inputData);
        }
        
        // 添加到历史记录
        setQueryHistory(prev => [{
          query: path,
          timestamp: Date.now(),
          resultCount: results.length
        }, ...prev].slice(0, 10));
      }
    } catch (err) {
      setQueryError('Invalid JSON or query format');
      setQueryResults([]);
    }
  }

  const handleLoadTestData = () => {
    setInput(JSON.stringify(TEST_DATA, null, 2))
    onSnackbar('Test data loaded!')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          JSONPath Query Tool - Extract Data from JSON
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Query and extract specific data from complex JSON structures using JSONPath expressions. 
          This powerful tool allows you to navigate and filter JSON data with precise path syntax, 
          ideal for API response analysis, data extraction, and JSON processing workflows.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {['JSONPath', 'JSON query', 'JSON extraction', 'JSON filter', 'JSON navigator', 'API response parser', 'JSON data select', 'Path expressions'].map((keyword) => (
            <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Quick Actions Bar */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<Info />}
                onClick={() => setShowGuide(!showGuide)}
              >
                {showGuide ? 'Hide Guide' : 'Show Guide'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PlayArrow />}
                onClick={handleLoadTestData}
              >
                Load Test Data
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                Click on any example below to try it out
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Guide Section */}
        <Grid item xs={12}>
          <Collapse in={showGuide}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                JSONPath Quick Guide
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  示例数据结构:
                </Typography>
                <Box sx={{ 
                  overflowX: 'auto',
                  '& pre': {
                    margin: 0,
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxWidth: '100%'
                  }
                }}>
                  <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    customStyle={{ 
                      margin: 0, 
                      borderRadius: 4,
                      minWidth: '100%',
                      maxHeight: '150px'
                    }}
                  >
                    {JSON.stringify({
                      store: {
                        book: [
                          {
                            author: 'J.K. Rowling',
                            title: 'Harry Potter',
                            price: 9.99,
                            inStock: true
                          },
                          // 更多图书...
                        ],
                        bicycle: { color: 'red', price: 199.99 }
                      }
                    }, null, 2)}
                  </SyntaxHighlighter>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                {COMMON_JSONPATH_EXAMPLES.map((example, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {example.label}
                        </Typography>
                        <Chip
                          label={example.path}
                          size="small"
                          onClick={() => handleExampleClick(example.path)}
                          sx={{ fontFamily: 'monospace', mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {example.path === '$' && '返回整个JSON对象'}
                          {example.path === '$.store' && '返回store对象及其所有内容'}
                          {example.path === '$.store.book[*]' && '返回所有书籍数组中的对象'}
                          {example.path === '$.store.book[0]' && '返回第一本书的所有信息'}
                          {example.path === '$.store.book[*].title' && '返回所有书的标题，如 ["Harry Potter",...]'}
                          {example.path === '$.store.book[?(@.inStock==true)]' && '返回所有库存为true的书'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  JSONPath 语法参考:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="$"
                      secondary="代表根对象"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="."
                      secondary="表示子元素，如 $.store.book 访问store下的book属性"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="[n]"
                      secondary="访问数组的第n个元素，如 $.store.book[0] 访问第一本书"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="[*]"
                      secondary="表示数组中的所有元素，如 $.store.book[*].title 返回所有书名"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="[?(条件)]"
                      secondary="根据条件筛选元素，如 $.store.book[?(@.price<10)] 返回价格小于10的书"
                    />
                  </ListItem>
                </List>
              </Box>
            </Paper>
          </Collapse>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              JSON Data
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter or paste your JSON data here..."
                error={!!queryError}
                helperText={queryError}
                sx={{ mb: 2 }}
              />
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => handlePaste(false)}
                size="small"
              >
                <ContentPaste />
              </IconButton>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              JSONPath Query
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your JSONPath query (e.g., $.store.book[*].title)"
                error={!!queryError}
                sx={{ mb: 2 }}
              />
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => handlePaste(true)}
                size="small"
              >
                <ContentPaste />
              </IconButton>
            </Box>

            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleQuery}
              fullWidth
            >
              Execute Query
            </Button>
          </Paper>

          {/* Results Section */}
          {queryResults.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Query Results ({queryResults.length})
              </Typography>
              <List>
                {queryResults.map((result, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace' }}>
                          {result.path}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                            Type: {result.type}
                          </Typography>
                          <Box sx={{ 
                            overflowX: 'auto',
                            '& pre': {
                              margin: 0,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              maxWidth: '100%'
                            }
                          }}>
                            <SyntaxHighlighter
                              language="json"
                              style={vscDarkPlus}
                              customStyle={{ 
                                margin: 0, 
                                borderRadius: 4,
                                minWidth: '100%'
                              }}
                            >
                              {JSON.stringify(result.value, null, 2)}
                            </SyntaxHighlighter>
                          </Box>
                        </Box>
                      }
                    />
                    <IconButton
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(result.value, null, 2))
                        onSnackbar('Result copied to clipboard!')
                      }}
                      size="small"
                    >
                      <ContentCopy />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* History Section */}
          {queryHistory.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">
                  Recent Queries
                </Typography>
                <IconButton
                  onClick={() => setShowHistory(!showHistory)}
                  size="small"
                >
                  {showHistory ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              <List dense>
                {queryHistory.slice(0, showHistory ? undefined : 1).map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {item.query}
                        </Typography>
                      }
                      secondary={new Date(item.timestamp).toLocaleString()}
                    />
                    <IconButton
                      onClick={() => {
                        setQuery(item.query)
                        handleQuery()
                        onSnackbar('Query restored!')
                      }}
                      size="small"
                    >
                      <History />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Examples */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Try These Examples
            </Typography>
            <List>
              {QUERY_EXAMPLES.map((example, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleExampleClick(example.path)}
                  sx={{ mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <ListItemText
                    primary={example.label}
                    secondary={
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                        {example.path}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
} 