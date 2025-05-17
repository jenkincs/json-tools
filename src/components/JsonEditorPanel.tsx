import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Stack,
  Divider,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  PlayArrow,
  Download,
  Upload,
  FormatPaint,
  Undo,
  Redo,
  Fullscreen,
  Close
} from '@mui/icons-material'
import { ShareButton } from './ShareButton'

// 导入Monaco编辑器
import Editor, { Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'

interface JsonEditorPanelProps {
  onSnackbar: (message: string) => void
  initialData?: string | null
}

export function JsonEditorPanel({ onSnackbar, initialData }: JsonEditorPanelProps) {
  const { t } = useTranslation()
  const [editorContent, setEditorContent] = useState('')
  const [editorOptions, setEditorOptions] = useState({
    autoClosingBrackets: true,
    autoClosingQuotes: true,
    autoIndent: true,
    formatOnPaste: true,
    formatOnType: false,
    tabCompletion: 'on'
  })
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const fullscreenEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)

  // 初始化编辑器内容
  useEffect(() => {
    if (initialData) {
      try {
        const parsedData = JSON.parse(initialData)
        setEditorContent(JSON.stringify(parsedData, null, 2))
      } catch {
        setEditorContent(initialData)
      }
    }
  }, [initialData])

  // 当编辑器挂载时的回调
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // 配置自动补全和验证
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: []
    })
  }

  // 全屏编辑器挂载
  const handleFullscreenEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    fullscreenEditorRef.current = editor
    
    // 同步配置
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: []
    })
  }

  // 打开全屏编辑器
  const handleOpenFullscreen = () => {
    setFullscreenOpen(true)
  }

  // 关闭全屏编辑器
  const handleCloseFullscreen = () => {
    // 将全屏编辑器的内容同步回主编辑器
    if (fullscreenEditorRef.current && editorRef.current) {
      const updatedContent = fullscreenEditorRef.current.getValue()
      editorRef.current.setValue(updatedContent)
      setEditorContent(updatedContent)
    }
    setFullscreenOpen(false)
  }

  // JSON格式化功能
  const formatJson = () => {
    if (!editorRef.current) return

    try {
      const currentValue = editorRef.current.getValue()
      const parsedJson = JSON.parse(currentValue)
      const formatted = JSON.stringify(parsedJson, null, 2)
      editorRef.current.setValue(formatted)
      onSnackbar(t('jsonEditor.formatSuccess'))
    } catch (error) {
      onSnackbar(t('common.error.invalidJson'))
    }
  }

  // 在全屏模式下格式化JSON
  const formatJsonFullscreen = () => {
    if (!fullscreenEditorRef.current) return

    try {
      const currentValue = fullscreenEditorRef.current.getValue()
      const parsedJson = JSON.parse(currentValue)
      const formatted = JSON.stringify(parsedJson, null, 2)
      fullscreenEditorRef.current.setValue(formatted)
      onSnackbar(t('jsonEditor.formatSuccess'))
    } catch (error) {
      onSnackbar(t('common.error.invalidJson'))
    }
  }

  // 从剪贴板粘贴
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (editorRef.current) {
        editorRef.current.setValue(text)
        onSnackbar(t('jsonEditor.pasteSuccess'))
      }
    } catch (error) {
      onSnackbar(t('common.error.clipboard'))
    }
  }

  // 复制到剪贴板
  const handleCopy = () => {
    if (!editorRef.current) return
    
    const content = editorRef.current.getValue()
    navigator.clipboard.writeText(content)
    onSnackbar(t('common.copied', { content: 'JSON' }))
  }

  // 下载JSON文件
  const handleDownload = () => {
    if (!editorRef.current) return
    
    const content = editorRef.current.getValue()
    if (!content.trim()) {
      onSnackbar(t('common.error.noData', { content: t('jsonEditor.title') }), )
      return
    }

    try {
      // 尝试解析以确保它是有效的JSON
      JSON.parse(content)
      
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'edited.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      onSnackbar(t('jsonEditor.downloadSuccess'))
    } catch (error) {
      onSnackbar(t('common.error.invalidJson'))
    }
  }

  // 上传JSON文件
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        if (editorRef.current) {
          editorRef.current.setValue(content)
        }
        onSnackbar(t('jsonEditor.uploadSuccess'))
      } catch (error) {
        onSnackbar(t('common.error.fileRead'))
      }
    }
    reader.readAsText(file)
  }

  // 编辑器内容变更处理
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value)
    }
  }, [])

  // 全屏编辑器内容变更处理
  const handleFullscreenEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value)
    }
  }, [])

  // 撤销操作
  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null)
    }
  }

  // 重做操作
  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null)
    }
  }

  // 切换编辑器选项
  const toggleEditorOption = (option: string) => {
    setEditorOptions(prev => ({
      ...prev,
      [option]: !prev[option as keyof typeof prev]
    }))
  }

  // 加载演示JSON
  const loadSampleJson = () => {
    const sampleJson = {
      "name": "JSON Editor Example",
      "features": [
        "Auto-completion",
        "Syntax highlighting",
        "Bracket matching",
        "Error checking"
      ],
      "settings": {
        "theme": "dark",
        "fontSize": 14,
        "autoSave": true
      },
      "statistics": {
        "users": 10000,
        "rating": 4.8,
        "activeInstalls": 8500
      }
    }
    
    if (editorRef.current) {
      editorRef.current.setValue(JSON.stringify(sampleJson, null, 2))
      onSnackbar(t('jsonEditor.sampleLoaded'))
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PlayArrow />}
            onClick={loadSampleJson}
          >
            {t('jsonEditor.loadSample')}
          </Button>
          <Button
            variant="contained"
            startIcon={<FormatPaint />}
            onClick={formatJson}
          >
            {t('jsonEditor.format')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={handleCopy}
          >
            {t('jsonEditor.copy')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentPaste />}
            onClick={handlePaste}
          >
            {t('jsonEditor.paste')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownload}
          >
            {t('jsonEditor.download')}
          </Button>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload />}
          >
            {t('jsonEditor.upload')}
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleUpload}
            />
          </Button>
          {editorContent && (
            <ShareButton 
              jsonContent={editorContent} 
              currentTool="jsonEditor"
              onSnackbar={onSnackbar}
            />
          )}
        </Stack>
      </Paper>

      {/* 编辑器设置 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>{t('jsonEditor.editorSettings')}</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <FormControlLabel
            control={
              <Switch
                checked={editorOptions.autoClosingBrackets}
                onChange={() => toggleEditorOption('autoClosingBrackets')}
                size="small"
              />
            }
            label={t('jsonEditor.settings.autoClosingBrackets')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editorOptions.autoClosingQuotes}
                onChange={() => toggleEditorOption('autoClosingQuotes')}
                size="small"
              />
            }
            label={t('jsonEditor.settings.autoClosingQuotes')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editorOptions.formatOnPaste}
                onChange={() => toggleEditorOption('formatOnPaste')}
                size="small"
              />
            }
            label={t('jsonEditor.settings.formatOnPaste')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editorOptions.formatOnType}
                onChange={() => toggleEditorOption('formatOnType')}
                size="small"
              />
            }
            label={t('jsonEditor.settings.formatOnType')}
          />
        </Stack>
      </Paper>

      {/* Monaco Editor */}
      <Paper>
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
          <Box>
            <Tooltip title={t('jsonEditor.undo')}>
              <IconButton onClick={handleUndo} size="small">
                <Undo fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('jsonEditor.redo')}>
              <IconButton onClick={handleRedo} size="small">
                <Redo fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Tooltip title={t('format.fullscreen')}>
            <IconButton onClick={handleOpenFullscreen} size="small">
              <Fullscreen fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: '400px' }}>
          <Editor
            height="400px"
            defaultLanguage="json"
            value={editorContent}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: true },
              lineNumbers: 'on',
              folding: true,
              autoIndent: 'advanced',
              formatOnPaste: editorOptions.formatOnPaste,
              formatOnType: editorOptions.formatOnType,
              autoClosingBrackets: editorOptions.autoClosingBrackets ? 'always' : 'never',
              autoClosingQuotes: editorOptions.autoClosingQuotes ? 'always' : 'never',
              tabCompletion: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </Box>
      </Paper>

      {/* 全屏编辑器对话框 */}
      <Dialog
        open={fullscreenOpen}
        onClose={handleCloseFullscreen}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
          <Typography variant="h6">{t('jsonEditor.title')}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FormatPaint />}
              onClick={formatJsonFullscreen}
              size="small"
            >
              {t('jsonEditor.format')}
            </Button>
            <Tooltip title={t('common.close')}>
              <IconButton onClick={handleCloseFullscreen} color="primary">
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 'calc(100vh - 64px)' }}>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={editorContent}
            onChange={handleFullscreenEditorChange}
            onMount={handleFullscreenEditorDidMount}
            options={{
              minimap: { enabled: true },
              lineNumbers: 'on',
              folding: true,
              autoIndent: 'advanced',
              formatOnPaste: editorOptions.formatOnPaste,
              formatOnType: editorOptions.formatOnType,
              autoClosingBrackets: editorOptions.autoClosingBrackets ? 'always' : 'never',
              autoClosingQuotes: editorOptions.autoClosingQuotes ? 'always' : 'never',
              tabCompletion: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: 16, // 放大字体，提高可读性
              lineHeight: 1.5, // 增加行高
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
} 