import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  FormControlLabel,
  Switch,
  InputAdornment,
  useTheme
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  Download,
  Upload,
  Key,
  Refresh,
  Security,
  LockOpen,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import { ShareButton } from './ShareButton'
import CryptoJS from 'crypto-js'

// 支持的加密算法
const ALGORITHMS = [
  { value: 'AES', label: 'AES (Advanced Encryption Standard)' },
  { value: 'DES', label: 'DES (Data Encryption Standard)' },
  { value: 'TripleDES', label: '3DES (Triple DES)' },
  { value: 'Rabbit', label: 'Rabbit' },
  { value: 'RC4', label: 'RC4 (Rivest Cipher 4)' },
  { value: 'RC4Drop', label: 'RC4Drop' }
]

interface JsonCryptoPanelProps {
  onSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void
  initialData?: string | null
}

export function JsonCryptoPanel({ onSnackbar, initialData }: JsonCryptoPanelProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [jsonInput, setJsonInput] = useState('')
  const [encryptedOutput, setEncryptedOutput] = useState('')
  const [encryptedInput, setEncryptedInput] = useState('')
  const [decryptedOutput, setDecryptedOutput] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [algorithm, setAlgorithm] = useState('AES')
  const [preserveFormatting, setPreserveFormatting] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)

  // 初始化输入数据
  useEffect(() => {
    if (initialData) {
      try {
        const parsedData = JSON.parse(initialData)
        setJsonInput(JSON.stringify(parsedData, null, 2))
      } catch {
        setJsonInput(initialData)
      }
    }
  }, [initialData])

  // 监听JSON输入，当输入为空时清空加密输出
  useEffect(() => {
    if (!jsonInput.trim()) {
      setEncryptedOutput('')
    }
  }, [jsonInput])

  // 监听加密输入，当输入为空时清空解密输出
  useEffect(() => {
    if (!encryptedInput.trim()) {
      setDecryptedOutput('')
    }
  }, [encryptedInput])

  // 生成随机密钥
  const generateRandomKey = () => {
    const randomKey = CryptoJS.lib.WordArray.random(16).toString()
    setSecretKey(randomKey)
    onSnackbar(t('jsonCrypto.keyGenerated'), 'success')
  }

  // 加密JSON数据
  const encryptData = useCallback(() => {
    if (!jsonInput.trim()) {
      onSnackbar(t('common.error.emptyInput', { content: 'JSON', action: t('jsonCrypto.encrypt') }), 'error')
      return
    }

    if (!secretKey.trim()) {
      onSnackbar(t('jsonCrypto.errors.noKey'), 'error')
      return
    }

    try {
      // 尝试解析JSON以验证格式
      let jsonData = jsonInput
      try {
        const parsed = JSON.parse(jsonInput)
        if (preserveFormatting) {
          jsonData = JSON.stringify(parsed, null, 2)
        } else {
          jsonData = JSON.stringify(parsed)
        }
      } catch (e) {
        onSnackbar(t('common.error.invalidJson'), 'error')
        return
      }

      let encrypted
      const metadata = includeMetadata ? { alg: algorithm, ts: new Date().toISOString() } : null

      // 根据选择的算法加密
      switch (algorithm) {
        case 'AES':
          encrypted = CryptoJS.AES.encrypt(jsonData, secretKey).toString()
          break
        case 'DES':
          encrypted = CryptoJS.DES.encrypt(jsonData, secretKey).toString()
          break
        case 'TripleDES':
          encrypted = CryptoJS.TripleDES.encrypt(jsonData, secretKey).toString()
          break
        case 'Rabbit':
          encrypted = CryptoJS.Rabbit.encrypt(jsonData, secretKey).toString()
          break
        case 'RC4':
          encrypted = CryptoJS.RC4.encrypt(jsonData, secretKey).toString()
          break
        case 'RC4Drop':
          encrypted = CryptoJS.RC4Drop.encrypt(jsonData, secretKey, { drop: 192 }).toString()
          break
        default:
          encrypted = CryptoJS.AES.encrypt(jsonData, secretKey).toString()
      }

      // 如果包含元数据，则将加密结果和元数据一起包装在一个对象中
      const result = metadata 
        ? JSON.stringify({ data: encrypted, meta: metadata })
        : encrypted

      setEncryptedOutput(result)
      onSnackbar(t('jsonCrypto.encryptSuccess'), 'success')
    } catch (error) {
      console.error('Encryption error:', error)
      onSnackbar(t('jsonCrypto.errors.encryptFailed'), 'error')
    }
  }, [jsonInput, secretKey, algorithm, preserveFormatting, includeMetadata, onSnackbar, t])

  // 解密数据
  const decryptData = useCallback(() => {
    if (!encryptedInput.trim()) {
      onSnackbar(t('common.error.emptyInput', { content: t('jsonCrypto.encryptedData'), action: t('jsonCrypto.decrypt') }), 'error')
      return
    }

    if (!secretKey.trim()) {
      onSnackbar(t('jsonCrypto.errors.noKey'), 'error')
      return
    }

    try {
      let encryptedData = encryptedInput
      let detectedAlgorithm = algorithm
      
      // 检查是否是包含元数据的JSON格式
      try {
        const parsed = JSON.parse(encryptedInput)
        if (parsed.data && parsed.meta) {
          encryptedData = parsed.data
          if (parsed.meta.alg) {
            detectedAlgorithm = parsed.meta.alg
          }
        }
      } catch {
        // 不是JSON格式，直接使用输入的加密文本
      }

      let decrypted
      
      // 根据检测到的算法解密
      switch (detectedAlgorithm) {
        case 'AES':
          decrypted = CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8)
          break
        case 'DES':
          decrypted = CryptoJS.DES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8)
          break
        case 'TripleDES':
          decrypted = CryptoJS.TripleDES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8)
          break
        case 'Rabbit':
          decrypted = CryptoJS.Rabbit.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8)
          break
        case 'RC4':
          decrypted = CryptoJS.RC4.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8)
          break
        case 'RC4Drop':
          decrypted = CryptoJS.RC4Drop.decrypt(encryptedData, secretKey, { drop: 192 }).toString(CryptoJS.enc.Utf8)
          break
        default:
          decrypted = CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8)
      }

      if (!decrypted) {
        onSnackbar(t('jsonCrypto.errors.decryptFailed'), 'error')
        return
      }

      // 尝试格式化JSON
      try {
        const parsedJson = JSON.parse(decrypted)
        setDecryptedOutput(JSON.stringify(parsedJson, null, 2))
      } catch {
        // 如果不是有效的JSON，直接显示解密结果
        setDecryptedOutput(decrypted)
      }

      onSnackbar(t('jsonCrypto.decryptSuccess'), 'success')
    } catch (error) {
      console.error('Decryption error:', error)
      onSnackbar(t('jsonCrypto.errors.decryptFailed'), 'error')
    }
  }, [encryptedInput, secretKey, algorithm, onSnackbar, t])

  // 复制到剪贴板
  const handleCopy = (text: string, contentType: string) => {
    navigator.clipboard.writeText(text)
    onSnackbar(t('common.copied', { content: contentType }))
  }

  // 从剪贴板粘贴
  const handlePaste = async (target: 'input' | 'encrypted' | 'key') => {
    try {
      const text = await navigator.clipboard.readText()
      if (target === 'input') {
        setJsonInput(text)
      } else if (target === 'encrypted') {
        setEncryptedInput(text)
      } else if (target === 'key') {
        setSecretKey(text)
      }
      onSnackbar(t('jsonCrypto.pasteSuccess'))
    } catch (error) {
      onSnackbar(t('common.error.clipboard'), 'error')
    }
  }

  // 下载加密/解密结果
  const handleDownload = (content: string, filePrefix: string) => {
    if (!content.trim()) {
      onSnackbar(t('common.error.noData', { content: filePrefix }), 'error')
      return
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    a.href = url
    a.download = `${filePrefix}-${timestamp}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onSnackbar(t('jsonCrypto.downloadSuccess'))
  }

  // 上传文件
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>, target: 'input' | 'encrypted' | 'key') => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        if (target === 'input') {
          setJsonInput(content)
        } else if (target === 'encrypted') {
          setEncryptedInput(content)
        } else if (target === 'key') {
          setSecretKey(content)
        }
        onSnackbar(t('jsonCrypto.uploadSuccess'))
      } catch (error) {
        onSnackbar(t('common.error.fileRead'), 'error')
      }
    }
    reader.readAsText(file)
  }

  // 加载示例JSON
  const loadSampleJson = () => {
    const sampleJson = {
      "user": {
        "id": 12345,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "isActive": true,
        "roles": ["user", "admin"],
        "preferences": {
          "theme": "dark",
          "notifications": true,
          "language": "en"
        },
        "metadata": {
          "lastLogin": "2023-05-15T08:30:45Z",
          "registrationDate": "2022-01-10T14:22:10Z"
        },
        "securitySettings": {
          "twoFactorEnabled": true,
          "passwordLastChanged": "2023-03-22T11:15:30Z"
        }
      }
    }
    
    setJsonInput(JSON.stringify(sampleJson, null, 2))
    onSnackbar(t('jsonCrypto.sampleLoaded'))
  }

  // 使用解密结果直接设置为加密输入
  const useDecryptedForEncryption = () => {
    setJsonInput(decryptedOutput)
    onSnackbar(t('jsonCrypto.readyToEncrypt'))
  }

  // 使用加密结果直接设置为解密输入
  const useEncryptedForDecryption = () => {
    setEncryptedInput(encryptedOutput)
    onSnackbar(t('jsonCrypto.readyToDecrypt'))
  }

  // 自定义文本区域组件，用于替代TextField
  const CustomTextArea = ({ 
    value, 
    onChange, 
    placeholder, 
    readOnly = false 
  }: { 
    value: string, 
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, 
    placeholder: string,
    readOnly?: boolean
  }) => (
    <Box 
      sx={{ 
        position: 'relative', 
        width: '100%', 
        mb: 2,
        flex: 1,
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}`,
        borderRadius: '4px',
        '&:hover': {
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.87)',
        },
        '&:focus-within': {
          borderColor: theme.palette.primary.main,
          borderWidth: '2px',
        }
      }}
    >
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: '100%',
          height: '300px',
          padding: '16.5px 14px',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: '1rem',
          border: 'none',
          outline: 'none',
          resize: 'none',
          overflow: 'auto',
          background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'none',
          color: theme.palette.text.primary
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('jsonCrypto.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('jsonCrypto.description')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {(() => {
            try {
              const keywords = t('jsonCrypto.keywords', { returnObjects: true });
              if (Array.isArray(keywords)) {
                return keywords.map((keyword, index) => (
                  <Chip 
                    key={index} 
                    label={String(keyword)} 
                    size="small" 
                    variant="outlined" 
                    sx={{ borderRadius: 1 }} 
                  />
                ));
              }
            } catch (error) {
              console.error('Error rendering keywords:', error);
            }
            return null;
          })()}
        </Box>
      </Box>

      {/* 加密设置 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="algorithm-select-label">{t('jsonCrypto.algorithm')}</InputLabel>
              <Select
                labelId="algorithm-select-label"
                value={algorithm}
                label={t('jsonCrypto.algorithm')}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                {ALGORITHMS.map((alg) => (
                  <MenuItem key={alg.value} value={alg.value}>
                    {alg.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <TextField
                label={t('jsonCrypto.secretKey')}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                type={showKey ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowKey(!showKey)}
                        edge="end"
                        aria-label={showKey ? t('jsonCrypto.hideKey') : t('jsonCrypto.showKey')}
                      >
                        {showKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      <IconButton
                        onClick={() => handlePaste('key')}
                        edge="end"
                        aria-label={t('jsonCrypto.pasteKey')}
                      >
                        <ContentPaste fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Key />}
                onClick={generateRandomKey}
                fullWidth
              >
                {t('jsonCrypto.generateKey')}
              </Button>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                aria-label={t('jsonCrypto.uploadKey')}
              >
                {t('jsonCrypto.uploadKey')}
                <input
                  type="file"
                  hidden
                  accept=".txt,.key"
                  onChange={(e) => handleUpload(e, 'key')}
                />
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preserveFormatting}
                  onChange={(e) => setPreserveFormatting(e.target.checked)}
                />
              }
              label={t('jsonCrypto.preserveFormatting')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                />
              }
              label={t('jsonCrypto.includeMetadata')}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 主要内容区域 - 加密部分 */}
      <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', pb: 1 }}>
        {t('jsonCrypto.encrypt')}
      </Typography>
      <Grid container spacing={2}>
        {/* 左侧面板 - JSON输入 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {t('jsonCrypto.jsonInput')}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadSampleJson}
                >
                  {t('jsonCrypto.loadSample')}
                </Button>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(jsonInput, t('jsonCrypto.jsonInput'))}
                  aria-label={t('jsonCrypto.copy')}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handlePaste('input')}
                  aria-label={t('jsonCrypto.paste')}
                >
                  <ContentPaste fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  component="label"
                  aria-label={t('jsonCrypto.upload')}
                >
                  <Upload fontSize="small" />
                  <input
                    type="file"
                    hidden
                    accept=".json,.txt"
                    onChange={(e) => handleUpload(e, 'input')}
                  />
                </IconButton>
              </Stack>
            </Box>
            <CustomTextArea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={t('jsonCrypto.enterJson')}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<Lock />}
              onClick={encryptData}
              disabled={!jsonInput.trim() || !secretKey.trim()}
            >
              {t('jsonCrypto.encrypt')}
            </Button>
          </Paper>
        </Grid>

        {/* 右侧面板 - 加密输出 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {t('jsonCrypto.encryptedOutput')}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(encryptedOutput, t('jsonCrypto.encryptedOutput'))}
                  aria-label={t('jsonCrypto.copy')}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDownload(encryptedOutput, 'encrypted-json')}
                  aria-label={t('jsonCrypto.download')}
                >
                  <Download fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
            <CustomTextArea
              value={encryptedOutput}
              placeholder={t('jsonCrypto.encryptedPlaceholder')}
              readOnly
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<LockOpen />}
                onClick={useEncryptedForDecryption}
                disabled={!encryptedOutput.trim()}
              >
                {t('jsonCrypto.useForDecryption')}
              </Button>
              {encryptedOutput && (
                <ShareButton 
                  jsonContent={encryptedOutput} 
                  currentTool="jsonCrypto"
                  onSnackbar={onSnackbar}
                />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 主要内容区域 - 解密部分 */}
      <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', pb: 1 }}>
        {t('jsonCrypto.decrypt')}
      </Typography>
      <Grid container spacing={2}>
        {/* 左侧面板 - 加密输入 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {t('jsonCrypto.encryptedInput')}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(encryptedInput, t('jsonCrypto.encryptedInput'))}
                  aria-label={t('jsonCrypto.copy')}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handlePaste('encrypted')}
                  aria-label={t('jsonCrypto.paste')}
                >
                  <ContentPaste fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  component="label"
                  aria-label={t('jsonCrypto.upload')}
                >
                  <Upload fontSize="small" />
                  <input
                    type="file"
                    hidden
                    accept=".json,.txt,.enc"
                    onChange={(e) => handleUpload(e, 'encrypted')}
                  />
                </IconButton>
              </Stack>
            </Box>
            <CustomTextArea
              value={encryptedInput}
              onChange={(e) => setEncryptedInput(e.target.value)}
              placeholder={t('jsonCrypto.encryptedPlaceholder')}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<LockOpen />}
              onClick={decryptData}
              disabled={!encryptedInput.trim() || !secretKey.trim()}
            >
              {t('jsonCrypto.decrypt')}
            </Button>
          </Paper>
        </Grid>

        {/* 右侧面板 - 解密输出 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {t('jsonCrypto.decryptedOutput')}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(decryptedOutput, t('jsonCrypto.decryptedOutput'))}
                  aria-label={t('jsonCrypto.copy')}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDownload(decryptedOutput, 'decrypted-json')}
                  aria-label={t('jsonCrypto.download')}
                >
                  <Download fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
            <CustomTextArea
              value={decryptedOutput}
              placeholder={t('jsonCrypto.decryptedPlaceholder')}
              readOnly
            />
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<Lock />}
              onClick={useDecryptedForEncryption}
              disabled={!decryptedOutput.trim()}
            >
              {t('jsonCrypto.useForEncryption')}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* 安全提示 */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          {t('jsonCrypto.securityTip')}
        </Typography>
      </Alert>
    </Box>
  )
} 