import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  Sort,
  Download,
  Upload,
  Code,
  ScienceRounded,
  RestartAlt
} from '@mui/icons-material'
// 移除 SyntaxHighlighter 导入
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ShareButton } from './ShareButton'
// 导入 Monaco 编辑器
import Editor from '@monaco-editor/react'
// 导入 JSON Viewer 组件
import { JsonViewer } from '@textea/json-viewer'

interface SortPanelProps {
  onSnackbar: (message: string) => void
  initialData?: string | null
}

export function SortPanel({ onSnackbar, initialData }: SortPanelProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [sorted, setSorted] = useState('')
  const [sortError, setSortError] = useState<string | null>(null)
  const [indentSize, setIndentSize] = useState('2')
  const [sortMethod, setSortMethod] = useState('asc') // 'asc' | 'desc' | 'keys'
  const [sortArrays, setSortArrays] = useState(true)
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [useJsonView, setUseJsonView] = useState(true)
  const [collapseLevel, setCollapseLevel] = useState(1)
  const [jsonViewKey, setJsonViewKey] = useState(0)
  
  // Monaco 编辑器选项
  const editorOptions = {
    readOnly: true,
    folding: true,
    foldingStrategy: 'indentation' as const,
    minimap: { enabled: false },
    lineNumbers: 'on' as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    formatOnPaste: true
  }

  // 处理分享链接传入的初始数据
  useEffect(() => {
    if (initialData) {
      try {
        setInput(initialData)
        const jsonData = JSON.parse(initialData)
        const sortedJson = sortJson(jsonData, sortMethod, sortArrays)
        const formattedJson = JSON.stringify(sortedJson, null, parseInt(indentSize))
        setSorted(formattedJson)
        setParsedJson(sortedJson)
        setSortError(null)
      } catch (err) {
        setSortError(t('common.error.invalidJson'))
      }
    }
  }, [initialData, indentSize, sortMethod, sortArrays, t])

  const handleSort = () => {
    try {
      if (!input.trim()) {
        setSortError(t('common.error.emptyInput', { content: 'JSON', action: t('sort.sort').toLowerCase() }))
        return
      }

      const jsonData = JSON.parse(input)
      const sortedJson = sortJson(jsonData, sortMethod, sortArrays)
      const formattedJson = JSON.stringify(sortedJson, null, parseInt(indentSize))
      setSorted(formattedJson)
      setParsedJson(sortedJson)
      setSortError(null)
    } catch (err) {
      setSortError(t('common.error.invalidJson'))
      setSorted('')
      setParsedJson(null)
    }
  }

  // 递归排序JSON对象
  const sortJson = (data: any, method: string, shouldSortArrays: boolean): any => {
    // 处理数组
    if (Array.isArray(data)) {
      // 对数组中的每个对象元素递归排序
      const sortedArray = data.map(item => {
        if (typeof item === 'object' && item !== null) {
          return sortJson(item, method, shouldSortArrays)
        }
        return item
      })
      
      // 如果设置了排序数组且是'asc'或'desc'，对数组中的值进行排序（如果是原始类型）
      if (shouldSortArrays && (method === 'asc' || method === 'desc') && sortedArray.every(item => typeof item !== 'object')) {
        return method === 'asc' 
          ? sortedArray.sort((a, b) => a > b ? 1 : -1) 
          : sortedArray.sort((a, b) => a < b ? 1 : -1)
      }
      
      return sortedArray
    }
    
    // 处理对象
    if (typeof data === 'object' && data !== null) {
      const result: Record<string, any> = {}
      
      // 按所选方法对键进行排序
      let keys = Object.keys(data)
      if (method === 'asc') {
        keys = keys.sort()
      } else if (method === 'desc') {
        keys = keys.sort().reverse()
      }
      
      // 递归排序对象的每个属性
      keys.forEach(key => {
        const value = data[key]
        if (typeof value === 'object' && value !== null) {
          result[key] = sortJson(value, method, shouldSortArrays)
        } else {
          result[key] = value
        }
      })
      
      return result
    }
    
    return data
  }

  const handleIndentSizeChange = (event: SelectChangeEvent) => {
    setIndentSize(event.target.value)
  }

  const handleSortMethodChange = (event: SelectChangeEvent) => {
    setSortMethod(event.target.value)
  }

  const handleSortArraysChange = (event: SelectChangeEvent) => {
    setSortArrays(event.target.value === 'true')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch (err) {
      setSortError(t('common.error.clipboard'))
    }
  }

  const handleDownload = () => {
    if (!sorted) {
      setSortError(t('common.error.noData', { content: t('sort.title') }))
      return
    }

    const blob = new Blob([sorted], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sorted.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onSnackbar(t('common.copied', { content: 'JSON file' }))
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        setInput(content)
        setSortError(null)
      } catch (err) {
        setSortError(t('common.error.fileRead'))
      }
    }
    reader.readAsText(file)
  }

  const handleMinify = () => {
    try {
      if (!sorted) {
        setSortError(t('common.error.noData', { content: t('sort.title') }))
        return
      }

      const jsonData = JSON.parse(sorted)
      const minifiedJson = JSON.stringify(jsonData)
      setSorted(minifiedJson)
    } catch (err) {
      setSortError(t('common.error.invalidJson'))
    }
  }

  const handleLoadTestData = () => {
    const testData = {
      z: "last alphabetically",
      arrays: {
        mixedTypes: [1, "string", true, null, { nestedObj: true }],
        numbers: [5, 3, 1, 4, 2],
        strings: ["banana", "apple", "cherry", "date"],
        objects: [
          { id: 3, name: "item c" },
          { id: 1, name: "item a" },
          { id: 2, name: "item b" }
        ]
      },
      nested: {
        b: {
          z: "nested z value",
          a: "nested a value"
        },
        a: {
          values: [5, 3, 1, 4, 2],
          isTest: true
        }
      },
      specialCases: {
        emptyArray: [],
        emptyObject: {},
        nullValue: null,
        booleanTrue: true,
        booleanFalse: false,
        number: 123.456,
        nestedEmpty: {
          empty: {}
        }
      },
      a: "first alphabetically"
    }

    const formattedJson = JSON.stringify(testData, null, parseInt(indentSize))
    setInput(formattedJson)
    setSortError(null)
  }

  // 处理折叠级别变化
  const handleCollapseLevelChange = (event: SelectChangeEvent) => {
    setCollapseLevel(Number(event.target.value))
  }

  // 重置视图功能
  const handleResetView = () => {
    setJsonViewKey(prevKey => prevKey + 1)
  }

  // 切换视图模式
  const handleViewModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseJsonView(event.target.checked)
  }

  // 自动折叠代码
  const handleEditorDidMount = (editor: any) => {
    // 非树形视图模式下完全展开所有内容
    setTimeout(() => {
      // 移除折叠，改为展开所有内容
      editor.getAction('editor.unfoldAll')?.run()
    }, 100)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('sort.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('sort.description')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {(t('sort.keywords', { returnObjects: true }) as string[]).map((keyword: string) => (
            <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>{t('sort.indent')}</InputLabel>
          <Select
            value={indentSize}
            label={t('sort.indent')}
            onChange={handleIndentSizeChange}
            size="small"
          >
            <MenuItem value="2">{t('sort.spaces', { count: 2 })}</MenuItem>
            <MenuItem value="4">{t('sort.spaces', { count: 4 })}</MenuItem>
            <MenuItem value="8">{t('sort.spaces', { count: 8 })}</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('sort.sortMethod')}</InputLabel>
          <Select
            value={sortMethod}
            label={t('sort.sortMethod')}
            onChange={handleSortMethodChange}
            size="small"
          >
            <MenuItem value="asc">{t('sort.sortAsc')}</MenuItem>
            <MenuItem value="desc">{t('sort.sortDesc')}</MenuItem>
            <MenuItem value="keys">{t('sort.sortKeys')}</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('sort.sortArrays')}</InputLabel>
          <Select
            value={sortArrays ? 'true' : 'false'}
            label={t('sort.sortArrays')}
            onChange={handleSortArraysChange}
            size="small"
          >
            <MenuItem value="true">{t('sort.yes')}</MenuItem>
            <MenuItem value="false">{t('sort.no')}</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          variant="contained"
          startIcon={<Sort />}
          onClick={handleSort}
        >
          {t('sort.sort')}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Code />}
          onClick={handleMinify}
          disabled={!sorted}
        >
          {t('sort.minify')}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownload}
          disabled={!sorted}
        >
          {t('sort.download')}
        </Button>
        
        <Button
          variant="outlined"
          component="label"
          startIcon={<Upload />}
        >
          {t('sort.upload')}
          <input
            type="file"
            hidden
            accept=".json"
            onChange={handleUpload}
          />
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<ScienceRounded />}
          onClick={handleLoadTestData}
        >
          {t('sort.loadTestData')}
        </Button>
        
        {sorted && (
          <ShareButton 
            jsonContent={sorted} 
            currentTool="sort"
            onSnackbar={onSnackbar}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('sort.enterJson')}
            error={!!sortError}
            helperText={sortError}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            <Tooltip title={t('sort.paste')}>
              <IconButton onClick={handlePaste} color="primary">
                <ContentPaste />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('sort.sort')}>
              <IconButton onClick={handleSort} color="primary">
                <Sort />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {sorted && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={useJsonView}
                      onChange={handleViewModeChange}
                      color="primary"
                    />
                  }
                  label={t('sort.useTreeView')}
                />
                
                {useJsonView && (
                  <>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>{t('sort.collapseLevel')}</InputLabel>
                      <Select
                        value={collapseLevel.toString()}
                        label={t('sort.collapseLevel')}
                        onChange={handleCollapseLevelChange}
                        size="small"
                      >
                        <MenuItem value="1">{t('sort.level')} 1</MenuItem>
                        <MenuItem value="2">{t('sort.level')} 2</MenuItem>
                        <MenuItem value="3">{t('sort.level')} 3</MenuItem>
                        <MenuItem value="99">{t('sort.all')}</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RestartAlt />}
                      onClick={handleResetView}
                    >
                      {t('sort.resetView')}
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Paper 
                sx={{ 
                  p: 2, 
                  position: 'relative', 
                  flex: 1,
                  overflow: 'hidden'
                }}
              >
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(sorted)
                    onSnackbar(t('common.copied', { content: t('sort.title') }))
                  }}
                  sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                  color="primary"
                  title={t('sort.copy')}
                >
                  <ContentCopy />
                </IconButton>
                
                {useJsonView && parsedJson ? (
                  <Box sx={{ 
                    overflowX: 'auto',
                    '& .json-viewer-container': {
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      p: 1
                    }
                  }}>
                    <JsonViewer 
                      value={parsedJson}
                      theme="dark" 
                      displayDataTypes={false}
                      enableClipboard={false}
                      defaultInspectDepth={collapseLevel === 99 ? 99 : collapseLevel - 1}
                      rootName={false}
                      key={`json-view-${collapseLevel}-${jsonViewKey}`}
                      style={{ backgroundColor: '#272822' }} // 匹配 monokai 主题
                    />
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: '400px',
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 1
                  }}>
                    <Editor 
                      height="400px"
                      language="json"
                      value={sorted}
                      options={editorOptions}
                      theme="vs-dark"
                      onMount={handleEditorDidMount}
                    />
                  </Box>
                )}
              </Paper>
              <Box sx={{ width: 48 }} />
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
} 