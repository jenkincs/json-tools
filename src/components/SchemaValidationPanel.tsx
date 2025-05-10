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
  Typography
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Ajv from 'ajv'

interface SchemaValidationPanelProps {
  onSnackbar: (message: string) => void
}

export function SchemaValidationPanel({ onSnackbar }: SchemaValidationPanelProps) {
  const [input, setInput] = useState('')
  const [schemaInput, setSchemaInput] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  const handleValidate = () => {
    try {
      if (!input.trim() || !schemaInput.trim()) {
        setValidationError('Please enter both JSON data and schema')
        return
      }

      const jsonData = JSON.parse(input)
      const schema = JSON.parse(schemaInput)

      const ajv = new Ajv({ allErrors: true })
      const validate = ajv.compile(schema)
      const valid = validate(jsonData)

      if (valid) {
        setValidationErrors([])
        setValidationError(null)
        onSnackbar('JSON is valid according to the schema!')
      } else {
        const errors = validate.errors?.map(error => {
          const path = error.instancePath || 'root'
          return `${path}: ${error.message}`
        }) || []
        setValidationErrors(errors)
        setValidationError('JSON is invalid according to the schema')
      }
    } catch (err) {
      setValidationError('Invalid JSON or schema format')
      setValidationErrors([])
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
            placeholder="Enter JSON data..."
            error={!!validationError}
            helperText={validationError}
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
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            placeholder="Enter JSON Schema..."
            error={!!validationError}
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
            onClick={handleValidate}
            size="large"
          >
            Validate
          </Button>
        </Box>

        {validationErrors.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" color="error">
                Validation Errors
              </Typography>
              <IconButton
                onClick={() => setShowValidationErrors(!showValidationErrors)}
                size="small"
              >
                {showValidationErrors ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            <Collapse in={showValidationErrors}>
              <List dense>
                {validationErrors.map((error, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Paper>
        )}

        {!validationError && input && schemaInput && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="success.main">
              JSON Schema Example
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
                {`{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["name", "age"]
}`}
              </SyntaxHighlighter>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  )
} 