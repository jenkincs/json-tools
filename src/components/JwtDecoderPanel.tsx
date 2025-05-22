import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  styled
} from '@mui/material';
import {
  ContentCopy,
  Delete,
  SecurityOutlined,
  Info,
  DataObject,
  AccessTime,
  Article,
  ContentPaste
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as jose from 'jose';
import { JwtTestDataGenerator } from './JwtTestDataGenerator';
import { JwtEncoderPanel } from './JwtEncoderPanel';
import { useTheme } from '@mui/material/styles';

// 自定义样式组件
const JwtContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  height: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}));

const JwtColumn = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto'
}));

const TokenInput = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    fontFamily: 'monospace',
    fontSize: '0.9rem'
  }
}));

interface JwtDecoderPanelProps {
  onSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
  initialData?: string | null;
}

interface DecodedJwt {
  header: any;
  payload: any;
  signature: string;
}

export function JwtDecoderPanel(props: JwtDecoderPanelProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [mode, setMode] = useState<'decode' | 'encode'>('decode');
  const [jwtToken, setJwtToken] = useState<string>(props.initialData || '');
  const [decodedJwt, setDecodedJwt] = useState<DecodedJwt | null>(null);
  const [verificationSecret, setVerificationSecret] = useState<string>('');
  const [, setIsVerified] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showTestDataGenerator, setShowTestDataGenerator] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{
    isExpired: boolean;
    expiresIn?: string;
    issuer?: string;
    subject?: string;
    audience?: string;
    issuedAt?: string;
  }>({
    isExpired: false
  });

  useEffect(() => {
    if (props.initialData) {
      decodeToken(props.initialData);
    }
  }, [props.initialData]);

  // 解码JWT令牌而不验证签名
  const decodeToken = (token: string) => {
    setError(null);
    setIsVerified(null);
    
    if (!token.trim()) {
      setDecodedJwt(null);
      return;
    }
    
    try {
      // 分割JWT令牌
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        throw new Error(t('jwtDecoder.errors.invalidToken'));
      }
      
      // 解码头部和有效载荷
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      setDecodedJwt({
        header,
        payload,
        signature: parts[2]
      });
      
      // 检查令牌是否过期
      checkTokenExpiration(payload);
      
    } catch (err) {
      console.error('JWT decoding error:', err);
      setError(err instanceof Error ? err.message : String(err));
      setDecodedJwt(null);
    }
  };
  
  // 验证JWT签名 - 使用jose库
  const verifyToken = async () => {
    setError(null);
    
    if (!jwtToken.trim()) {
      setError(t('jwtDecoder.errors.noToken'));
      return;
    }
    
    if (!verificationSecret.trim()) {
      setError(t('jwtDecoder.errors.noSecret'));
      return;
    }
    
    try {
      // 创建签名密钥
      const encoder = new TextEncoder();
      const secretKey = encoder.encode(verificationSecret);
      
      // 验证签名
      await jose.jwtVerify(jwtToken, secretKey);
      
      setIsVerified(true);
      props.onSnackbar(t('jwtDecoder.messages.verificationSuccess'), 'success');
    } catch (err) {
      console.error('JWT verification error:', err);
      setIsVerified(false);
      setError(err instanceof Error ? err.message : String(err));
      props.onSnackbar(t('jwtDecoder.messages.verificationFailed'), 'error');
    }
  };
  
  // 检查令牌过期状态
  const checkTokenExpiration = (payload: any) => {
    const now = Math.floor(Date.now() / 1000);
    const info = {
      isExpired: false,
      issuer: payload.iss,
      subject: payload.sub,
      audience: payload.aud,
      issuedAt: ''
    };
    // 检查过期状态
    if (payload.exp) {
      info.isExpired = now > payload.exp;
    }
    // 发行时间
    if (payload.iat) {
      const issuedDate = new Date(payload.iat * 1000);
      info.issuedAt = issuedDate.toLocaleString();
    }
    setTokenInfo(info);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = e.target.value;
    setJwtToken(newToken);
    
    if (newToken.trim()) {
      decodeToken(newToken);
    } else {
      setDecodedJwt(null);
      setError(null);
      setIsVerified(null);
    }
  };
  
  const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationSecret(e.target.value);
    setIsVerified(null); // 重置验证状态
  };
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleClear = () => {
    setJwtToken('');
    setDecodedJwt(null);
    setVerificationSecret('');
    setIsVerified(null);
    setError(null);
  };
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        props.onSnackbar(t('jwtDecoder.messages.copied', { type }), 'success');
      },
      (err) => {
        console.error('Failed to copy:', err);
        props.onSnackbar(t('common.error.clipboard'), 'error');
      }
    );
  };
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJwtToken(text);
      decodeToken(text);
    } catch (err) {
      console.error('Failed to paste:', err);
      props.onSnackbar(t('common.error.clipboard'), 'error');
    }
  };
  
  // 格式化JSON
  const formatJson = (json: any): string => {
    return JSON.stringify(json, null, 2);
  };

  // 时间戳字段列表
  const timeFields = ['exp', 'iat', 'nbf', 'auth_time', 'updated_at'];

  // 将时间戳转换为本地日期时间字符串
  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp * 1000); // JWT时间戳通常是秒为单位
      return date.toLocaleString();
    } catch (e) {
      return '';
    }
  };

  // 统一输出区域样式
  const outputStyle = {
    margin: 0,
    borderRadius: '4px',
    background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f5f8ff',
    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#000000',
    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : '#c0d0e0'}`,
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    padding: '16px',
    minHeight: 120,
    fontWeight: 400,
    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.08)'
  };

  // 自定义语法高亮主题
  const customSyntaxTheme = {
    ...(theme.palette.mode === 'dark' ? vscDarkPlus : vs),
    'property': {
      color: theme.palette.mode === 'dark' ? '#9cdcfe' : '#2e86de',
    }
  };

  // 渲染JSON
  const renderJson = (json: any): JSX.Element => {
    const jsonString = formatJson(json);
    
    // 查找并收集时间戳字段
    const timeValues: {field: string, timestamp: number, localTime: string}[] = [];
    
    // 检查是否有时间戳字段
    timeFields.forEach(field => {
      if (json[field] && typeof json[field] === 'number') {
        timeValues.push({
          field,
          timestamp: json[field],
          localTime: formatTimestamp(json[field])
        });
      }
    });
    
    return (
      <Box>
        <Box sx={{ position: 'relative' }}>
          <SyntaxHighlighter
            language="json"
            style={customSyntaxTheme}
            customStyle={outputStyle}
          >
            {jsonString}
          </SyntaxHighlighter>
          <IconButton
            size="small"
            onClick={() => copyToClipboard(jsonString, t('common.json'))}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'background.paper',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              },
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Box>
        
        {/* 时间字段本地时间展示 */}
        {timeValues.length > 0 && (
          <Paper 
            variant="outlined" 
            sx={{ 
              mt: 2,
              p: 1.5,
              bgcolor: 'background.default'
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              {t('jwtDecoder.timestamps')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {timeValues.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1, minWidth: 60 }}>
                    {item.field}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {item.timestamp}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                    →
                  </Typography>
                  <Typography variant="body2">
                    {item.localTime}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Box>
    );
  };

  // 处理从测试数据生成器选择的令牌
  const handleSelectToken = (token: string) => {
    setJwtToken(token);
    decodeToken(token);
  };

  // 生成样例数据
  const generateSampleToken = async () => {
    const sampleSecret = 'your-256-bit-secret';
    const currentTime = Math.floor(Date.now() / 1000);
    
    const claims = {
      sub: 'test-user',
      name: 'Test User',
      role: 'admin',
      iat: currentTime,
      exp: currentTime + 3600 // 1小时后过期
    };

    try {
      const encoder = new TextEncoder();
      const secretKey = encoder.encode(sampleSecret);
      
      const jwt = await new jose.SignJWT(claims)
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secretKey);

      setJwtToken(jwt);
      setVerificationSecret(sampleSecret);
      decodeToken(jwt);
      props.onSnackbar(t('jwtDecoder.messages.sampleTokenGenerated'), 'success');
    } catch (err) {
      console.error('Sample token generation error:', err);
      props.onSnackbar(t('jwtDecoder.messages.sampleTokenError'), 'error');
    }
  };

  // TabPanel 组件定义
  function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`jwt-tabpanel-${index}`}
        aria-labelledby={`jwt-tab-${index}`}
        {...other}
      >
        {value === index && <Box>{children}</Box>}
      </div>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 顶部切换按钮 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 3 }}>
        <Typography
          variant="h5"
          component="span"
          sx={{
            fontWeight: mode === 'decode' ? 700 : 400,
            color: mode === 'decode' ? 'text.primary' : 'text.disabled',
            cursor: mode === 'decode' ? 'default' : 'pointer',
            borderRight: '2px solid',
            borderColor: mode === 'decode' ? 'primary.main' : 'transparent',
            pr: 2,
            mr: 2
          }}
          onClick={() => setMode('decode')}
        >
          {t('jwtPage.decoder')}
        </Typography>
        <Typography
          variant="h5"
          component="span"
          sx={{
            fontWeight: mode === 'encode' ? 700 : 400,
            color: mode === 'encode' ? 'text.primary' : 'text.disabled',
            cursor: mode === 'encode' ? 'default' : 'pointer',
          }}
          onClick={() => setMode('encode')}
        >
          {t('jwtPage.encoder')}
        </Typography>
        <Tooltip title={t('jwtDecoder.info')}>
          <IconButton size="small">
            <Info fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {/* 内容区 */}
      {mode === 'decode' ? (
        <JwtContainer>
          <JwtColumn elevation={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">
                {t('jwtDecoder.encoded')}
              </Typography>
              <Button
                size="small"
                onClick={generateSampleToken}
                startIcon={<DataObject />}
              >
                {t('jwtDecoder.generateSample')}
              </Button>
            </Box>
            
            <TokenInput
              multiline
              rows={8}
              fullWidth
              variant="outlined"
              value={jwtToken}
              onChange={handleTokenChange}
              placeholder={t('jwtDecoder.placeholder')}
              error={!!error}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ContentPaste />}
                onClick={handlePaste}
              >
                {t('common.paste')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Delete />}
                onClick={handleClear}
              >
                {t('common.clear')}
              </Button>
            </Box>

            {/* 验证部分 */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('jwtDecoder.verification.title')}
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={verificationSecret}
                onChange={handleSecretChange}
                placeholder={t('jwtDecoder.verification.placeholder')}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={verifyToken}
                startIcon={<SecurityOutlined />}
                disabled={!jwtToken || !verificationSecret}
              >
                {t('jwtDecoder.verification.verify')}
              </Button>
            </Box>
          </JwtColumn>

          {/* 右侧列 - 解码结果 */}
          <JwtColumn elevation={2}>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : decodedJwt ? (
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label={t('jwtDecoder.tabs.decoded')} />
                    <Tab label={t('jwtDecoder.tabs.payload')} />
                    <Tab label={t('jwtDecoder.tabs.header')} />
                  </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                  {tokenInfo.issuer ? (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 1.5, 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: 'background.default'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Article fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {t('jwtDecoder.tokenInfo.issuer')}:
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {tokenInfo.issuer}
                        </Typography>
                      </Box>
                    </Paper>
                  ) : null}
                  {renderJson(decodedJwt.payload)}
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  {renderJson(decodedJwt.payload)}
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  {renderJson(decodedJwt.header)}
                </TabPanel>
              </>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography color="text.secondary">
                  {t('jwtDecoder.noData')}
                </Typography>
              </Box>
            )}
          </JwtColumn>
        </JwtContainer>
      ) : (
        <JwtEncoderPanel onSnackbar={props.onSnackbar} />
      )}

      {/* 测试数据生成器对话框 */}
      {showTestDataGenerator && (
        <JwtTestDataGenerator
          open={showTestDataGenerator}
          onClose={() => setShowTestDataGenerator(false)}
          onSelect={handleSelectToken}
        />
      )}
    </Box>
  );
} 