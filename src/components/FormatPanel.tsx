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
  Dialog,
  DialogContent,
  DialogTitle} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  FormatPaint,
  Download,
  Upload,
  Code,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Close
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ShareButton } from './ShareButton'

interface FormatPanelProps {
  onSnackbar: (message: string) => void
  initialData?: string | null
}

export function FormatPanel({ onSnackbar, initialData }: FormatPanelProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [formatted, setFormatted] = useState('')
  const [formatError, setFormatError] = useState<string | null>(null)
  const [indentSize, setIndentSize] = useState('2')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [fullscreenZoom, setFullscreenZoom] = useState(1)

  // 处理分享链接传入的初始数据
  useEffect(() => {
    if (initialData) {
      try {
        setInput(initialData)
        const jsonData = JSON.parse(initialData)
        const formattedJson = JSON.stringify(jsonData, null, parseInt(indentSize))
        setFormatted(formattedJson)
        setFormatError(null)
      } catch (err) {
        setFormatError(t('common.error.invalidJson'))
      }
    }
  }, [initialData, indentSize, t])

  const handleFormat = () => {
    try {
      if (!input.trim()) {
        setFormatError(t('common.error.emptyInput', { content: 'JSON', action: t('format.format').toLowerCase() }))
        return
      }

      const jsonData = JSON.parse(input)
      const formattedJson = JSON.stringify(jsonData, null, parseInt(indentSize))
      setFormatted(formattedJson)
      setFormatError(null)
    } catch (err) {
      setFormatError(t('common.error.invalidJson'))
      setFormatted('')
    }
  }

  const handleMinify = () => {
    try {
      if (!input.trim()) {
        setFormatError(t('common.error.emptyInput', { content: 'JSON', action: t('format.minify').toLowerCase() }))
        return
      }

      const jsonData = JSON.parse(input)
      const minifiedJson = JSON.stringify(jsonData)
      setFormatted(minifiedJson)
      setFormatError(null)
    } catch (err) {
      setFormatError(t('common.error.invalidJson'))
      setFormatted('')
    }
  }

  const handleIndentSizeChange = (event: SelectChangeEvent) => {
    setIndentSize(event.target.value)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch (err) {
      setFormatError(t('common.error.clipboard'))
    }
  }

  const handleDownload = () => {
    if (!formatted) {
      setFormatError(t('common.error.noData', { content: t('format.title') }))
      return
    }

    const blob = new Blob([formatted], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
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
        setFormatError(null)
      } catch (err) {
        setFormatError(t('common.error.fileRead'))
      }
    }
    reader.readAsText(file)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2))
  }
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6))
  }
  
  const handleFullscreenZoomIn = () => {
    setFullscreenZoom(prev => Math.min(prev + 0.2, 2))
  }
  
  const handleFullscreenZoomOut = () => {
    setFullscreenZoom(prev => Math.max(prev - 0.2, 0.6))
  }
  
  const handleOpenFullscreen = () => {
    setFullscreenZoom(zoomLevel)
    setFullscreenOpen(true)
  }
  
  const handleCloseFullscreen = () => {
    setFullscreenOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('format.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('format.description')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {(t('format.keywords', { returnObjects: true }) as string[]).map((keyword: string) => (
            <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>{t('format.indent')}</InputLabel>
          <Select
            value={indentSize}
            label={t('format.indent')}
            onChange={handleIndentSizeChange}
            size="small"
          >
            <MenuItem value="2">{t('format.spaces', { count: 2 })}</MenuItem>
            <MenuItem value="4">{t('format.spaces', { count: 4 })}</MenuItem>
            <MenuItem value="8">{t('format.spaces', { count: 8 })}</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<FormatPaint />}
          onClick={handleFormat}
        >
          {t('format.format')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Code />}
          onClick={handleMinify}
        >
          {t('format.minify')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownload}
          disabled={!formatted}
        >
          {t('format.download')}
        </Button>
        <Button
          variant="outlined"
          component="label"
          startIcon={<Upload />}
        >
          {t('format.upload')}
          <input
            type="file"
            hidden
            accept=".json"
            onChange={handleUpload}
          />
        </Button>
        {formatted && (
          <ShareButton 
            jsonContent={formatted} 
            currentTool="format"
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
            placeholder={t('format.enterJson')}
            error={!!formatError}
            helperText={formatError}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            <Tooltip title={t('format.paste')}>
              <IconButton onClick={handlePaste} color="primary">
                <ContentPaste />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('format.format')}>
              <IconButton onClick={handleFormat} color="primary">
                <FormatPaint />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {formatted && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Paper 
              sx={{ 
                p: 2, 
                position: 'relative', 
                flex: 1,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                maxHeight: '500px',
                overflowY: 'auto',
                overflowX: 'auto',
                '& pre': {
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxWidth: '100%',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s ease'
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
                  {formatted}
                </SyntaxHighlighter>
              </Box>
            </Paper>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Tooltip title={t('format.zoomIn')}>
                <IconButton
                  onClick={handleZoomIn}
                  color="primary"
                >
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('format.zoomOut')}>
                <IconButton
                  onClick={handleZoomOut}
                  color="primary"
                >
                  <ZoomOut />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('format.copy')}>
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(formatted)
                    onSnackbar(t('common.copied', { content: t('format.title') }))
                  }}
                  color="primary"
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('format.fullscreen')}>
                <IconButton
                  onClick={handleOpenFullscreen}
                  color="primary"
                >
                  <Fullscreen />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Fullscreen Dialog */}
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{t('format.title')}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('format.zoomIn')}>
              <IconButton onClick={handleFullscreenZoomIn} color="primary">
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('format.zoomOut')}>
              <IconButton onClick={handleFullscreenZoomOut} color="primary">
                <ZoomOut />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('format.copy')}>
              <IconButton 
                onClick={() => {
                  navigator.clipboard.writeText(formatted)
                  onSnackbar(t('common.copied', { content: t('format.title') }))
                }}
                color="primary"
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.close')}>
              <IconButton onClick={handleCloseFullscreen} color="primary">
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Box sx={{ 
            height: '100%',
            overflow: 'auto',
            '& pre': {
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              transform: `scale(${fullscreenZoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease'
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
              {formatted}
            </SyntaxHighlighter>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
} 