import { useState } from 'react'
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  Button
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  Compare
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { findDifferences } from '../utils/jsonUtils'

interface ComparePanelProps {
  onSnackbar: (message: string) => void
}

export function ComparePanel({ onSnackbar }: ComparePanelProps) {
  const [input, setInput] = useState('')
  const [compareInput, setCompareInput] = useState('')
  const [diffResult, setDiffResult] = useState('')
  const [compareError, setCompareError] = useState<string | null>(null)

  const handleCompare = () => {
    try {
      if (!input.trim() || !compareInput.trim()) {
        setCompareError('Please enter both JSON objects to compare')
        return
      }

      const json1 = JSON.parse(input)
      const json2 = JSON.parse(compareInput)
      const differences = findDifferences(json1, json2)
      const formattedDiff = JSON.stringify(differences, null, 2)
      setDiffResult(formattedDiff)
      setCompareError(null)
    } catch (err) {
      setCompareError('Invalid JSON format')
      setDiffResult('')
    }
  }

  const handlePaste = async (isCompare: boolean) => {
    try {
      const text = await navigator.clipboard.readText()
      if (isCompare) {
        setCompareInput(text)
      } else {
        setInput(text)
      }
    } catch (err) {
      setCompareError('Failed to read from clipboard')
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter first JSON..."
            error={!!compareError}
            helperText={compareError}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            <Tooltip title="Paste">
              <IconButton onClick={() => handlePaste(false)} color="primary">
                <ContentPaste />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={compareInput}
            onChange={(e) => setCompareInput(e.target.value)}
            placeholder="Enter second JSON..."
            error={!!compareError}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            <Tooltip title="Paste">
              <IconButton onClick={() => handlePaste(true)} color="primary">
                <ContentPaste />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Compare />}
            onClick={handleCompare}
            size="large"
          >
            Compare
          </Button>
        </Box>

        {diffResult && (
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
                  navigator.clipboard.writeText(diffResult)
                  onSnackbar('Comparison result copied to clipboard!')
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
                  {diffResult}
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