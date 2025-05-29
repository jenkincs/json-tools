import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Typography,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material'
import {
  ContentCopy,
  ContentPaste,
  PlayArrow,
  Clear,
  Fullscreen,
  Close,
  VpnKey,
  Search
} from '@mui/icons-material'
import { ShareButton } from './ShareButton'

interface CookieToolPanelProps {
  onSnackbar: (message: string) => void
  initialData?: string | null
}

interface CookiePair {
  key: string
  value: string
  decoded: string
  isJWT?: boolean
  jwtDecoded?: any
}

interface JWTDecoded {
  header: any
  payload: any
  signature: string
  valid?: boolean
}

export function CookieToolPanel({ onSnackbar, initialData }: CookieToolPanelProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [input, setInput] = useState('')
  const [parsedCookies, setParsedCookies] = useState<CookiePair[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [jwtDialogOpen, setJwtDialogOpen] = useState(false)
  const [selectedJWT, setSelectedJWT] = useState<JWTDecoded | null>(null)

  // 处理分享链接传入的初始数据
  useEffect(() => {
    if (initialData) {
      setInput(initialData)
      handleParse(initialData)
    }
  }, [initialData, t])

  // JWT检测函数
  const isJWTToken = (value: string): boolean => {
    if (!value || typeof value !== 'string') return false
    // JWT格式为三段由点分隔的Base64编码字符串
    const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/
    return jwtRegex.test(value)
  }

  // JWT解析函数
  const parseJWT = (token: string): JWTDecoded | null => {
    try {
      if (!isJWTToken(token)) {
        return null
      }
      
      const parts = token.split('.')
      if (parts.length !== 3) return null

      // 正确处理Base64URL编码
      const decodeBase64 = (str: string): string => {
        try {
          // 将Base64URL转换为常规Base64
          const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
          // 填充字符串
          const padding = '='.repeat((4 - base64.length % 4) % 4)
          return base64 + padding
        } catch (e) {
          return str
        }
      }

      // 解码并解析头部和载荷
      let header = {}
      let payload = {}
      
      try {
        header = JSON.parse(atob(decodeBase64(parts[0])))
      } catch (e) {
        console.error('JWT头部解析错误:', e)
      }
      
      try {
        payload = JSON.parse(atob(decodeBase64(parts[1])))
      } catch (e) {
        console.error('JWT载荷解析错误:', e)
      }
      
      return {
        header,
        payload,
        signature: parts[2],
        valid: Object.keys(header).length > 0 && Object.keys(payload).length > 0
      }
    } catch (error) {
      console.error('JWT解析错误:', error)
      return {
        header: {},
        payload: {},
        signature: '',
        valid: false
      }
    }
  }

  const handleParse = (cookieString?: string) => {
    const inputToParse = cookieString || input
    
    try {
      if (!inputToParse.trim()) {
        setParseError(t('common.error.emptyInput', { content: 'Cookie', action: t('cookieTool.parse').toLowerCase() }))
        return
      }

      // 清理输入：移除可能的 "Cookie: " 前缀
      let cleanInput = inputToParse.trim()
      if (cleanInput.toLowerCase().startsWith('cookie:')) {
        cleanInput = cleanInput.substring(7).trim()
      }

      // 解析cookie字符串
      const cookies: CookiePair[] = []
      const pairs = cleanInput.split(';')

      for (const pair of pairs) {
        const trimmedPair = pair.trim()
        if (!trimmedPair) continue

        const equalIndex = trimmedPair.indexOf('=')
        if (equalIndex === -1) {
          // 没有等号的情况，整个字符串作为key，value为空
          cookies.push({
            key: trimmedPair,
            value: '',
            decoded: '',
            isJWT: false
          })
        } else {
          const key = trimmedPair.substring(0, equalIndex).trim()
          const value = trimmedPair.substring(equalIndex + 1).trim()
          
          // 尝试URL解码
          let decoded = value
          try {
            decoded = decodeURIComponent(value)
          } catch {
            // 如果解码失败，使用原始值
            decoded = value
          }

          // 检测是否为JWT
          const isJWT = isJWTToken(decoded)
          let jwtDecoded = null
          if (isJWT) {
            jwtDecoded = parseJWT(decoded)
            // 如果解析失败，将isJWT设为false
            if (!jwtDecoded || !jwtDecoded.valid) {
              jwtDecoded = null
            }
          }

          cookies.push({
            key,
            value,
            decoded,
            isJWT,
            jwtDecoded
          })
        }
      }

      setParsedCookies(cookies)
      setParseError(null)
    } catch (err) {
      setParseError(t('cookieTool.error.invalidCookie'))
      setParsedCookies([])
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch (err) {
      setParseError(t('common.error.clipboard'))
    }
  }

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content)
      onSnackbar(t('common.copied', { content: type }))
    } catch (err) {
      onSnackbar(t('common.error.clipboard'))
    }
  }

  const handleClear = () => {
    setInput('')
    setParsedCookies([])
    setParseError(null)
    setSearchQuery('')
  }

  const handleLoadExample = () => {
    // 示例cookie字符串，包含一个有效的JWT令牌样例
    const exampleCookie = 'sessionId=abc123; userId=12345; preferences=theme%3Ddark%26lang%3Den; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTYyMzkwMjIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIn0.mXiRoVLR5J_-IZX7AZ0iepFMXUCE3nQJF-QBVJ1qjps'
    setInput(exampleCookie)
    handleParse(exampleCookie)
  }

  const handleJWTDialogOpen = (jwtData: JWTDecoded) => {
    console.log('打开JWT对话框，数据:', jwtData)
    setSelectedJWT(jwtData)
    setJwtDialogOpen(true)
  }

  const handleJWTDialogClose = () => {
    setJwtDialogOpen(false)
    setSelectedJWT(null)
  }

  // 过滤搜索结果
  const filteredCookies = parsedCookies.filter(cookie =>
    cookie.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cookie.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cookie.decoded.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatJWTTime = (timestamp: number): string => {
    if (!timestamp) return t('cookieTool.jwt.notSet')
    try {
      return new Date(timestamp * 1000).toLocaleString()
    } catch {
      return t('cookieTool.jwt.invalid')
    }
  }

  // 格式化JWT内容并添加语法高亮
  const formatJSONWithHighlight = (json: object): string => {
    try {
      // 为深色模式定制的高亮样式
      const isDark = theme.palette.mode === 'dark'
      const strJson = JSON.stringify(json, null, 2) || '{}'
      
      // 替换键、值和标点符号，添加不同颜色
      return strJson
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
          let color = isDark ? '#89DDFF' : '#032f62'  // 字符串为蓝色
          if (/^"/.test(match) && /:$/.test(match)) {
            color = isDark ? '#C792EA' : '#a626a4'    // 键名为紫色
          } else if (/true|false/.test(match)) {
            color = isDark ? '#FF9D00' : '#986801'    // 布尔值为橙色
          } else if (/null/.test(match)) {
            color = isDark ? '#FF5370' : '#e45649'    // null为红色
          } else if (/\d+/.test(match)) {
            color = isDark ? '#F78C6C' : '#986801'    // 数字为橙色
          }
          return `<span style="color:${color}">${match}</span>`
        })
    } catch (error) {
      console.error('格式化JSON出错:', error)
      return JSON.stringify(json, null, 2) || '{}'
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement - Page Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('cookieTool.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('cookieTool.description')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {(t('cookieTool.keywords', { returnObjects: true }) as string[]).map((keyword: string) => (
            <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>

      {/* 输入区域 */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('cookieTool.input')}
          </Typography>
          <Button variant="outlined" size="small" onClick={handleLoadExample}>
            {t('cookieTool.loadExample')}
          </Button>
          <Tooltip title={t('cookieTool.paste')}>
            <IconButton onClick={handlePaste} size="small">
              <ContentPaste />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('cookieTool.fullscreen')}>
            <IconButton onClick={() => setFullscreenOpen(true)} size="small">
              <Fullscreen />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('cookieTool.clear')}>
            <IconButton onClick={handleClear} size="small">
              <Clear />
            </IconButton>
          </Tooltip>
          <ShareButton
            jsonContent={input}
            currentTool="cookieTool"
            onSnackbar={onSnackbar}
          />
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('cookieTool.enterCookie')}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {t('cookieTool.instructions')}
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => handleParse()}
            startIcon={<PlayArrow />}
            disabled={!input.trim()}
          >
            {t('cookieTool.parse')}
          </Button>
        </Box>
      </Paper>

      {/* 错误显示 */}
      {parseError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {parseError}
        </Alert>
      )}

      {/* 解析结果 */}
      {parsedCookies.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6">
              {t('cookieTool.results')} ({filteredCookies.length} / {parsedCookies.length} {t('cookieTool.cookies')})
            </Typography>
            <TextField
              size="small"
              placeholder={t('cookieTool.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('cookieTool.key')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('cookieTool.value')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('cookieTool.decoded')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 160 }}>{t('cookieTool.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCookies.map((cookie, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {cookie.key}
                        </Typography>
                        <Tooltip title={t('cookieTool.copyKey')}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopy(cookie.key, t('cookieTool.key'))}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all', maxWidth: 200 }}>
                          {cookie.value || t('cookieTool.empty')}
                        </Typography>
                        {cookie.value && (
                          <Tooltip title={t('cookieTool.copyValue')}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCopy(cookie.value, t('cookieTool.value'))}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            wordBreak: 'break-all', 
                            maxWidth: 200,
                            color: cookie.decoded !== cookie.value ? 'primary.main' : 'text.secondary'
                          }}
                        >
                          {cookie.decoded || t('cookieTool.empty')}
                        </Typography>
                        {cookie.isJWT && (
                          <Chip 
                            label="JWT" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }}
                          />
                        )}
                        {cookie.decoded && (
                          <Tooltip title={t('cookieTool.copyDecoded')}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCopy(cookie.decoded, t('cookieTool.decodedValue'))}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Tooltip title={t('cookieTool.copyPair')}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopy(`${cookie.key}=${cookie.value}`, t('cookieTool.cookiePair'))}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {cookie.isJWT && (
                          <Tooltip title={t('cookieTool.jwt.decode')}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                if (cookie.jwtDecoded) {
                                  handleJWTDialogOpen(cookie.jwtDecoded)
                                } else {
                                  // 如果未解析，重新尝试解析
                                  const jwtToken = cookie.decoded
                                  if (jwtToken) {
                                    const parsedJwt = parseJWT(jwtToken)
                                    if (parsedJwt) {
                                      handleJWTDialogOpen(parsedJwt)
                                    }
                                  }
                                }
                              }}
                            >
                              <VpnKey fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 功能说明 */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('cookieTool.features')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {t('cookieTool.feature1')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('cookieTool.feature1.description')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {t('cookieTool.feature2')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('cookieTool.feature2.description')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {t('cookieTool.feature3')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('cookieTool.feature3.description')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {t('cookieTool.feature4')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('cookieTool.feature4.description')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 全屏输入对话框 */}
      <Dialog 
        open={fullscreenOpen} 
        onClose={() => setFullscreenOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{t('cookieTool.fullscreenTitle')}</Typography>
            <IconButton onClick={() => setFullscreenOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            multiline
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('cookieTool.enterCookie')}
            variant="outlined"
            sx={{ flexGrow: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaste} startIcon={<ContentPaste />}>
            {t('cookieTool.paste')}
          </Button>
          <Button onClick={() => setFullscreenOpen(false)} variant="contained">
            {t('cookieTool.done')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* JWT解析对话框 */}
      <Dialog 
        open={jwtDialogOpen} 
        onClose={handleJWTDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            backgroundImage: 'none', // 去除深色模式的背景颜色
            borderRadius: 2
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VpnKey color="primary" />
              <Typography variant="h6">{t('cookieTool.jwt.title')}</Typography>
            </Box>
            <IconButton onClick={handleJWTDialogClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedJWT && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* JWT Header */}
              <Paper 
                elevation={theme.palette.mode === 'dark' ? 0 : 1} 
                sx={{ 
                  p: 2,
                  border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
                  borderRadius: 2
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  color="primary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {t('cookieTool.jwt.header')}
                </Typography>
                <pre 
                  style={{ 
                    background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f5f5f5',
                    color: theme.palette.text.primary,
                    padding: '12px', 
                    borderRadius: '8px', 
                    overflow: 'auto',
                    fontSize: '13px',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                  dangerouslySetInnerHTML={{ __html: formatJSONWithHighlight(selectedJWT.header) }}
                />
              </Paper>

              {/* JWT Payload */}
              <Paper 
                elevation={theme.palette.mode === 'dark' ? 0 : 1} 
                sx={{ 
                  p: 2,
                  border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
                  borderRadius: 2
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  color="primary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {t('cookieTool.jwt.payload')}
                </Typography>
                <pre 
                  style={{ 
                    background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f5f5f5',
                    color: theme.palette.text.primary,
                    padding: '12px', 
                    borderRadius: '8px', 
                    overflow: 'auto',
                    fontSize: '13px',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                  dangerouslySetInnerHTML={{ __html: formatJSONWithHighlight(selectedJWT.payload) }}
                />

                {/* 常见字段解释 */}
                {selectedJWT.payload && Object.keys(selectedJWT.payload).length > 0 && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Typography variant="subtitle2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                      {t('cookieTool.jwt.commonFields')}:
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                      {selectedJWT.payload.sub && (
                        <Typography variant="body2">
                          <strong>sub:</strong> {selectedJWT.payload.sub}
                        </Typography>
                      )}
                      {selectedJWT.payload.name && (
                        <Typography variant="body2">
                          <strong>name:</strong> {selectedJWT.payload.name}
                        </Typography>
                      )}
                      {selectedJWT.payload.iat && (
                        <Typography variant="body2">
                          <strong>iat:</strong> {formatJWTTime(selectedJWT.payload.iat)}
                        </Typography>
                      )}
                      {selectedJWT.payload.exp && (
                        <Typography variant="body2">
                          <strong>exp:</strong> {formatJWTTime(selectedJWT.payload.exp)}
                        </Typography>
                      )}
                      {selectedJWT.payload.email && (
                        <Typography variant="body2">
                          <strong>email:</strong> {selectedJWT.payload.email}
                        </Typography>
                      )}
                      {selectedJWT.payload.role && (
                        <Typography variant="body2">
                          <strong>role:</strong> {selectedJWT.payload.role}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Paper>

              {/* JWT Signature */}
              <Paper 
                elevation={theme.palette.mode === 'dark' ? 0 : 1} 
                sx={{ 
                  p: 2,
                  border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
                  borderRadius: 2
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  color="primary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {t('cookieTool.jwt.signature')}
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f5f5f5',
                  border: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography variant="body2" sx={{ 
                    wordBreak: 'break-all', 
                    fontFamily: 'monospace',
                    color: theme.palette.mode === 'dark' ? '#89DDFF' : '#032f62'
                  }}>
                    {selectedJWT.signature || ''}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
          <Button 
            onClick={handleJWTDialogClose} 
            variant="contained" 
            color="primary"
            startIcon={<Close />}
          >
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 