import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Typography,
  Chip
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
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [compareInput, setCompareInput] = useState('')
  const [diffResult, setDiffResult] = useState('')
  const [compareError, setCompareError] = useState<string | null>(null)

  const handleCompare = () => {
    try {
      if (!input.trim() || !compareInput.trim()) {
        setCompareError(t('common.error.emptyInput', { content: t('compare.title'), action: t('compare.compare').toLowerCase() }))
        return
      }

      const json1 = JSON.parse(input)
      const json2 = JSON.parse(compareInput)
      const differences = findDifferences(json1, json2)
      const formattedDiff = JSON.stringify(differences, null, 2)
      setDiffResult(formattedDiff)
      setCompareError(null)
    } catch (err) {
      setCompareError(t('common.error.invalidJson'))
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
      setCompareError(t('common.error.clipboard'))
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('compare.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('compare.description')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {t('compare.keywords', { returnObjects: true }).map((keyword: string) => (
            <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('compare.firstJson')}
            error={!!compareError}
            helperText={compareError}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            <Tooltip title={t('format.paste')}>
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
            placeholder={t('compare.secondJson')}
            error={!!compareError}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            <Tooltip title={t('format.paste')}>
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
            {t('compare.compare')}
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
                  onSnackbar(t('compare.result'))
                }}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                color="primary"
                title={t('format.copy')}
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