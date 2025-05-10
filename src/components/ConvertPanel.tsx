import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  SelectChangeEvent,
  Chip
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  SwapHoriz
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import yaml from 'js-yaml'
import jsontoxml from 'jsontoxml'
import Papa from 'papaparse'
import { ConversionOptions } from '../types'
import { flattenObject, processData } from '../utils/jsonUtils'

interface ConvertPanelProps {
  onSnackbar: (message: string) => void
}

export function ConvertPanel({ onSnackbar }: ConvertPanelProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('')
  const [convertedOutput, setConvertedOutput] = useState('')
  const [conversionError, setConversionError] = useState<string | null>(null)
  const [conversionType, setConversionType] = useState<'json' | 'yaml' | 'xml' | 'csv'>('json')
  const [indentSize, setIndentSize] = useState('2')
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({
    xml: {
      pretty: true,
      indent: '  ',
      header: true
    },
    csv: {
      delimiter: ',',
      header: true,
      flatten: true
    }
  })

  const handleConvert = () => {
    try {
      if (!input.trim()) {
        setConversionError(t('common.error.emptyInput', { content: 'content', action: 'convert' }));
        return
      }

      if (conversionType === 'json') {
        // Convert JSON to YAML
        const jsonData = JSON.parse(input)
        const yamlOutput = yaml.dump(jsonData, {
          indent: parseInt(indentSize),
          lineWidth: -1,
          noRefs: true,
        })
        setConvertedOutput(yamlOutput)
      } else if (conversionType === 'xml') {
        // Convert JSON to XML
        const jsonData = JSON.parse(input)
        const xmlOutput = jsontoxml(jsonData, {
          prettyPrint: conversionOptions.xml.pretty,
          indent: conversionOptions.xml.indent,
          xmlHeader: conversionOptions.xml.header
        })
        setConvertedOutput(xmlOutput)
      } else if (conversionType === 'csv') {
        // Convert JSON to CSV
        const jsonData = JSON.parse(input)
        const data = conversionOptions.csv.flatten ? 
          [processData(flattenObject(jsonData))] : 
          Array.isArray(jsonData) ? processData(jsonData) : [processData(jsonData)]
        
        const csvOutput = Papa.unparse(data, {
          delimiter: conversionOptions.csv.delimiter,
          header: conversionOptions.csv.header
        })
        
        setConvertedOutput(csvOutput)
      } else {
        // Convert YAML to JSON
        const jsonData = yaml.load(input)
        const jsonOutput = JSON.stringify(jsonData, null, parseInt(indentSize))
        setConvertedOutput(jsonOutput)
      }
      setConversionError(null)
    } catch (err) {
      setConversionError(t('common.error.invalidJson'));
      setConvertedOutput('')
    }
  }

  const handleConversionTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'json' | 'yaml' | 'xml' | 'csv' | null
  ) => {
    if (newType !== null) {
      setConversionType(newType)
      setConvertedOutput('')
      setConversionError(null)
    }
  }

  const handleOptionChange = (format: 'xml' | 'csv', option: string, value: any) => {
    setConversionOptions(prev => ({
      ...prev,
      [format]: {
        ...prev[format],
        [option]: value
      }
    }))
  }

  const handleIndentSizeChange = (event: SelectChangeEvent) => {
    setIndentSize(event.target.value)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch (err) {
      setConversionError(t('common.error.clipboard'));
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('convert.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('convert.description')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {t('convert.keywords', { returnObjects: true }).map((keyword: string) => (
            <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <ToggleButtonGroup
          value={conversionType}
          exclusive
          onChange={handleConversionTypeChange}
          aria-label="conversion type"
        >
          <ToggleButton value="json" aria-label="json to yaml">
            {t('convert.jsonToYaml')}
          </ToggleButton>
          <ToggleButton value="yaml" aria-label="yaml to json">
            {t('convert.yamlToJson')}
          </ToggleButton>
          <ToggleButton value="xml" aria-label="json to xml">
            {t('convert.jsonToXml')}
          </ToggleButton>
          <ToggleButton value="csv" aria-label="json to csv">
            {t('convert.jsonToCsv')}
          </ToggleButton>
        </ToggleButtonGroup>
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
      </Box>

      {(conversionType === 'xml' || conversionType === 'csv') && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('convert.options')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {conversionType === 'xml' && (
              <>
                <FormControl size="small">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={conversionOptions.xml.pretty}
                        onChange={(e) => handleOptionChange('xml', 'pretty', e.target.checked)}
                      />
                    }
                    label={t('convert.prettyPrint')}
                  />
                </FormControl>
                <FormControl size="small">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={conversionOptions.xml.header}
                        onChange={(e) => handleOptionChange('xml', 'header', e.target.checked)}
                      />
                    }
                    label={t('convert.xmlHeader')}
                  />
                </FormControl>
              </>
            )}
            {conversionType === 'csv' && (
              <>
                <FormControl size="small">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={conversionOptions.csv.header}
                        onChange={(e) => handleOptionChange('csv', 'header', e.target.checked)}
                      />
                    }
                    label={t('convert.includeHeader')}
                  />
                </FormControl>
                <FormControl size="small">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={conversionOptions.csv.flatten}
                        onChange={(e) => handleOptionChange('csv', 'flatten', e.target.checked)}
                      />
                    }
                    label={t('convert.flattenObjects')}
                  />
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>{t('convert.delimiter')}</InputLabel>
                  <Select
                    value={conversionOptions.csv.delimiter}
                    label={t('convert.delimiter')}
                    onChange={(e) => handleOptionChange('csv', 'delimiter', e.target.value)}
                    size="small"
                  >
                    <MenuItem value=",">,</MenuItem>
                    <MenuItem value=";">;</MenuItem>
                    <MenuItem value="\t">Tab</MenuItem>
                    <MenuItem value="|">|</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={conversionType === 'yaml' ? t('convert.enterYaml') : t('convert.enterJson')}
            error={!!conversionError}
            helperText={conversionError}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            <Tooltip title={t('format.paste')}>
              <IconButton onClick={handlePaste} color="primary">
                <ContentPaste />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('convert.convert')}>
              <IconButton onClick={handleConvert} color="primary">
                <SwapHoriz />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {convertedOutput && (
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
                  navigator.clipboard.writeText(convertedOutput)
                  onSnackbar(t('convert.result'))
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
                  language={conversionType === 'yaml' ? 'yaml' : 
                           conversionType === 'xml' ? 'xml' : 
                           conversionType === 'csv' ? 'text' : 'json'}
                  style={vscDarkPlus}
                  customStyle={{ 
                    margin: 0, 
                    borderRadius: 4,
                    minWidth: '100%'
                  }}
                >
                  {convertedOutput}
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