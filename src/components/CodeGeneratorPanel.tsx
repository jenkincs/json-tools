import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  SelectChangeEvent
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  Code,
  Upload,
  Download
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { generateTypeScript, generateJava, generateCSharp, generatePython, generateGo, generateSwift } from '../utils/codeGenerators'

// 编程语言类型
type Language = 'typescript' | 'java' | 'csharp' | 'python' | 'go' | 'swift'

interface CodeGeneratorPanelProps {
  onSnackbar: (message: string) => void
}

export function CodeGeneratorPanel({ onSnackbar }: CodeGeneratorPanelProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<Language>('typescript')
  const [options, setOptions] = useState({
    className: 'RootObject',
    useInterfaces: true,
    useOptionalProps: true,
    usePascalCase: true,
    useJSONAttributes: true
  })

  // 处理语言选择变化
  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value as Language;
    setLanguage(newLanguage);
    
    // 根据语言自动调整属性命名规则
    // Java、Python、Swift使用驼峰命名，TypeScript、C#、Go使用帕斯卡命名
    const shouldUsePascalCase = ['typescript', 'csharp', 'go'].includes(newLanguage);
    setOptions(prev => ({ ...prev, usePascalCase: shouldUsePascalCase }));
    
    if (input) {
      handleGenerate(newLanguage, { ...options, usePascalCase: shouldUsePascalCase });
    }
  }

  // 处理选项变化
  const handleOptionChange = (option: keyof typeof options, value: boolean | string) => {
    setOptions(prev => ({ ...prev, [option]: value }))
    if (input) {
      handleGenerate(language, { ...options, [option]: value })
    }
  }

  // 生成代码
  const handleGenerate = (lang: Language = language, opts = options) => {
    try {
      if (!input.trim()) {
        setError(t('common.error.emptyInput', { content: 'JSON', action: t('codeGenerator.generate').toLowerCase() }))
        return
      }

      const jsonData = JSON.parse(input)
      let result = ''

      switch (lang) {
        case 'typescript':
          result = generateTypeScript(jsonData, opts)
          break
        case 'java':
          result = generateJava(jsonData, opts)
          break
        case 'csharp':
          result = generateCSharp(jsonData, opts)
          break
        case 'python':
          result = generatePython(jsonData, opts)
          break
        case 'go':
          result = generateGo(jsonData, opts)
          break
        case 'swift':
          result = generateSwift(jsonData, opts)
          break
      }

      setGeneratedCode(result)
      setError(null)
    } catch (err) {
      setError(t('common.error.invalidJson'))
      setGeneratedCode('')
    }
  }

  // 粘贴
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch (err) {
      setError(t('common.error.clipboard'))
    }
  }

  // 复制
  const handleCopy = () => {
    if (!generatedCode) {
      setError(t('common.error.noData', { content: t('codeGenerator.generatedCode') }))
      return
    }

    navigator.clipboard.writeText(generatedCode)
    onSnackbar(t('common.copied', { content: t('codeGenerator.generatedCode') }))
  }

  // 下载代码
  const handleDownload = () => {
    if (!generatedCode) {
      setError(t('common.error.noData', { content: t('codeGenerator.generatedCode') }))
      return
    }

    const fileExtension = getFileExtension(language)
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${options.className}.${fileExtension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onSnackbar(t('common.copied', { content: t('codeGenerator.generatedCode') }))
  }

  // 获取文件扩展名
  const getFileExtension = (lang: Language): string => {
    switch (lang) {
      case 'typescript': return 'ts'
      case 'java': return 'java'
      case 'csharp': return 'cs'
      case 'python': return 'py'
      case 'go': return 'go'
      case 'swift': return 'swift'
      default: return 'txt'
    }
  }

  // 获取语法高亮语言
  const getSyntaxHighlightLanguage = (lang: Language): string => {
    switch (lang) {
      case 'typescript': return 'typescript'
      case 'java': return 'java'
      case 'csharp': return 'csharp'
      case 'python': return 'python'
      case 'go': return 'go'
      case 'swift': return 'swift'
      default: return 'typescript'
    }
  }

  // 上传文件
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        setInput(content)
        setError(null)
      } catch (err) {
        setError(t('common.error.fileRead'))
      }
    }
    reader.readAsText(file)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('codeGenerator.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('codeGenerator.description')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {['JSON', 'Code Generator', 'TypeScript', 'Java', 'C#', 'Python', 'Go', 'Swift', 'Class', 'Interface'].map((keyword) => (
            <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
      
      {/* Language Selection and Options */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('codeGenerator.targetLanguage')}</InputLabel>
          <Select
            value={language}
            label={t('codeGenerator.targetLanguage')}
            onChange={handleLanguageChange}
            size="small"
          >
            <MenuItem value="typescript">TypeScript</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="csharp">C#</MenuItem>
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="go">Go</MenuItem>
            <MenuItem value="swift">Swift</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          size="small"
          label={t('codeGenerator.rootClassName')}
          value={options.className}
          onChange={(e) => handleOptionChange('className', e.target.value)}
          sx={{ minWidth: 150 }}
        />
        
        <Button
          variant="contained"
          startIcon={<Code />}
          onClick={() => handleGenerate()}
        >
          {t('codeGenerator.generate')}
        </Button>
        
        <Button
          variant="outlined"
          component="label"
          startIcon={<Upload />}
        >
          {t('codeGenerator.upload')}
          <input
            type="file"
            hidden
            accept=".json"
            onChange={handleUpload}
          />
        </Button>
      </Box>
      
      {/* Additional Options */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('codeGenerator.options')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {language === 'typescript' && (
            <Button
              variant={options.useInterfaces ? "contained" : "outlined"}
              size="small"
              onClick={() => handleOptionChange('useInterfaces', !options.useInterfaces)}
            >
              {options.useInterfaces ? 
                t('codeGenerator.useInterfaces') : 
                t('codeGenerator.useClasses')}
            </Button>
          )}
          
          <Button
            variant={options.useOptionalProps ? "contained" : "outlined"}
            size="small"
            onClick={() => handleOptionChange('useOptionalProps', !options.useOptionalProps)}
          >
            {options.useOptionalProps ? 
              t('codeGenerator.optionalProps') : 
              t('codeGenerator.requiredProps')}
          </Button>
          
          <Button
            variant={options.usePascalCase ? "contained" : "outlined"}
            size="small"
            onClick={() => handleOptionChange('usePascalCase', !options.usePascalCase)}
          >
            {options.usePascalCase ? 
              "PascalCase" : 
              "camelCase"}
          </Button>
          
          {['java', 'csharp'].includes(language) && (
            <Button
              variant={options.useJSONAttributes ? "contained" : "outlined"}
              size="small"
              onClick={() => handleOptionChange('useJSONAttributes', !options.useJSONAttributes)}
            >
              {options.useJSONAttributes ? 
                t('codeGenerator.useJsonAnnotations') : 
                t('codeGenerator.noJsonAnnotations')}
            </Button>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* JSON Input */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('codeGenerator.jsonInput')}
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('format.enterJson')}
              error={!!error}
              helperText={error}
              sx={{ mb: 2 }}
            />
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={handlePaste}
              size="small"
            >
              <ContentPaste />
            </IconButton>
          </Box>
        </Box>

        {/* Generated Code */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              {t('codeGenerator.generatedCode')}
            </Typography>
            <Box>
              <IconButton
                onClick={handleCopy}
                disabled={!generatedCode}
                size="small"
              >
                <ContentCopy />
              </IconButton>
              <IconButton
                onClick={handleDownload}
                disabled={!generatedCode}
                size="small"
              >
                <Download />
              </IconButton>
            </Box>
          </Box>
          <Paper 
            sx={{ 
              p: 2, 
              position: 'relative',
              height: '400px',
              overflow: 'hidden'
            }}
          >
            {generatedCode ? (
              <Box sx={{ 
                overflowX: 'auto',
                overflowY: 'auto',
                height: '100%',
                '& pre': {
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }
              }}>
                <SyntaxHighlighter
                  language={getSyntaxHighlightLanguage(language)}
                  style={vscDarkPlus}
                  customStyle={{ 
                    margin: 0, 
                    borderRadius: 4,
                    minWidth: '100%',
                    height: '100%'
                  }}
                >
                  {generatedCode}
                </SyntaxHighlighter>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('codeGenerator.noCodeGenerated')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
} 