import { useState } from 'react'
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
  SelectChangeEvent
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  FormatPaint,
  Download,
  Upload,
  Code
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface FormatPanelProps {
  onSnackbar: (message: string) => void
}

export function FormatPanel({ onSnackbar }: FormatPanelProps) {
  const [input, setInput] = useState('')
  const [formatted, setFormatted] = useState('')
  const [formatError, setFormatError] = useState<string | null>(null)
  const [indentSize, setIndentSize] = useState('2')

  const handleFormat = () => {
    try {
      if (!input.trim()) {
        setFormatError('Please enter some JSON to format')
        return
      }

      const jsonData = JSON.parse(input)
      const formattedJson = JSON.stringify(jsonData, null, parseInt(indentSize))
      setFormatted(formattedJson)
      setFormatError(null)
    } catch (err) {
      setFormatError('Invalid JSON format')
      setFormatted('')
    }
  }

  const handleMinify = () => {
    try {
      if (!input.trim()) {
        setFormatError('Please enter some JSON to minify')
        return
      }

      const jsonData = JSON.parse(input)
      const minifiedJson = JSON.stringify(jsonData)
      setFormatted(minifiedJson)
      setFormatError(null)
    } catch (err) {
      setFormatError('Invalid JSON format')
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
      setFormatError('Failed to read from clipboard')
    }
  }

  const handleDownload = () => {
    if (!formatted) {
      setFormatError('No formatted JSON to download')
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
    onSnackbar('JSON file downloaded successfully!')
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
        setFormatError('Failed to read file')
      }
    }
    reader.readAsText(file)
  }

  return (
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
        <Button
          variant="contained"
          startIcon={<FormatPaint />}
          onClick={handleFormat}
        >
          Format
        </Button>
        <Button
          variant="outlined"
          startIcon={<Code />}
          onClick={handleMinify}
        >
          Minify
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownload}
          disabled={!formatted}
        >
          Download
        </Button>
        <Button
          variant="outlined"
          component="label"
          startIcon={<Upload />}
        >
          Upload
          <input
            type="file"
            hidden
            accept=".json"
            onChange={handleUpload}
          />
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter JSON..."
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
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(formatted)
                  onSnackbar('Formatted JSON copied to clipboard!')
                }}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                color="primary"
                title="Copy"
              >
                <ContentCopy />
              </IconButton>
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
                  {formatted}
                </SyntaxHighlighter>
              </Box>
            </Paper>
            <Box sx={{ width: 48 }} />
          </Box>
        )}
      </Box>
    </Box>
  )
} 