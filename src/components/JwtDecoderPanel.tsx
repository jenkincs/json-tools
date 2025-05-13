import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Grid,
  Alert,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton,
  Chip
} from '@mui/material';
import {
  ContentCopy,
  Delete,
  SecurityOutlined,
  CheckCircleOutline,
  ErrorOutline,
  HelpOutline,
  Info,
  DataObject,
  AccessTime
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as jose from 'jose';
import { JwtTestDataGenerator } from './JwtTestDataGenerator';

interface JwtDecoderPanelProps {
  onSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
  initialData?: string | null;
}

interface DecodedJwt {
  header: any;
  payload: any;
  signature: string;
}

export function JwtDecoderPanel({ onSnackbar, initialData }: JwtDecoderPanelProps) {
  const { t } = useTranslation();
  const [jwtToken, setJwtToken] = useState<string>(initialData || '');
  const [decodedJwt, setDecodedJwt] = useState<DecodedJwt | null>(null);
  const [verificationSecret, setVerificationSecret] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
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
    if (initialData) {
      decodeToken(initialData);
    }
  }, [initialData]);

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
      onSnackbar(t('jwtDecoder.messages.verificationSuccess'), 'success');
    } catch (err) {
      console.error('JWT verification error:', err);
      setIsVerified(false);
      setError(err instanceof Error ? err.message : String(err));
      onSnackbar(t('jwtDecoder.messages.verificationFailed'), 'error');
    }
  };
  
  // 检查令牌过期状态
  const checkTokenExpiration = (payload: any) => {
    const now = Math.floor(Date.now() / 1000);
    const info = {
      isExpired: false,
      expiresIn: '',
      issuer: payload.iss,
      subject: payload.sub,
      audience: payload.aud,
      issuedAt: ''
    };
    
    // 检查过期时间
    if (payload.exp) {
      info.isExpired = now > payload.exp;
      
      // 计算剩余时间
      if (!info.isExpired) {
        const diffSeconds = payload.exp - now;
        if (diffSeconds < 60) {
          info.expiresIn = `${diffSeconds} ${t('jwtDecoder.seconds')}`;
        } else if (diffSeconds < 3600) {
          info.expiresIn = `${Math.floor(diffSeconds / 60)} ${t('jwtDecoder.minutes')}`;
        } else if (diffSeconds < 86400) {
          info.expiresIn = `${Math.floor(diffSeconds / 3600)} ${t('jwtDecoder.hours')}`;
        } else {
          info.expiresIn = `${Math.floor(diffSeconds / 86400)} ${t('jwtDecoder.days')}`;
        }
      } else {
        info.expiresIn = t('jwtDecoder.expired');
      }
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
        onSnackbar(t('jwtDecoder.messages.copied', { type }), 'success');
      },
      (err) => {
        console.error('Failed to copy:', err);
        onSnackbar(t('common.error.clipboard'), 'error');
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
      onSnackbar(t('common.error.clipboard'), 'error');
    }
  };
  
  // 格式化JSON
  const formatJson = (json: any): string => {
    return JSON.stringify(json, null, 2);
  };

  // 时间戳字段列表
  const timeFields = ['exp', 'iat', 'nbf', 'auth_time', 'updated_at'];

  // 检查是否为时间戳字段

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

  // 渲染带有时间戳提示的JSON
  const renderJsonWithTimeTooltips = (json: any): JSX.Element => {
    const jsonString = formatJson(json);
    const lines = jsonString.split('\n');
    
    return (
      <>
        {lines.map((line, index) => {
          // 检查该行是否包含时间戳字段
          const timeFieldMatch = timeFields.some(field => 
            line.includes(`"${field}": `) || line.includes(`"${field}":`));
          
          if (timeFieldMatch) {
            // 提取时间戳值
            const valueMatch = line.match(/: (\d+)(,?)$/);
            if (valueMatch && valueMatch[1]) {
              const timestamp = parseInt(valueMatch[1], 10);
              const formattedTime = formatTimestamp(timestamp);
              
              if (formattedTime) {
                // 将行分割为前半部分（包含字段名）和后半部分（值）
                const parts = line.split(': ');
                if (parts.length === 2) {
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                      <span>{parts[0]}: </span>
                      <Tooltip 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ mr: 1, fontSize: 'small' }} />
                            {formattedTime}
                          </Box>
                        }
                        arrow
                      >
                        <span style={{ 
                          borderBottom: '1px dotted #888',
                          cursor: 'help'
                        }}>
                          {valueMatch[1]}{valueMatch[2] || ''}
                        </span>
                      </Tooltip>
                    </div>
                  );
                }
              }
            }
          }
          
          return <div key={index}>{line}</div>;
        })}
      </>
    );
  };

  // 处理从测试数据生成器选择的令牌
  const handleSelectToken = (token: string) => {
    setJwtToken(token);
    decodeToken(token);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('jwtDecoder.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('jwtDecoder.description')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DataObject />}
              onClick={() => setShowTestDataGenerator(!showTestDataGenerator)}
            >
              {showTestDataGenerator 
                ? t('jwtDecoder.hideTestData') 
                : t('jwtDecoder.showTestData')
              }
            </Button>
          </Box>
          
          {showTestDataGenerator && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <JwtTestDataGenerator 
                onSelectToken={handleSelectToken} 
                onSnackbar={onSnackbar} 
              />
            </Paper>
          )}
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('jwtDecoder.inputLabel')}
            </Typography>
            
            <TextField
              label={t('jwtDecoder.tokenInputLabel')}
              value={jwtToken}
              onChange={handleTokenChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder={t('jwtDecoder.tokenPlaceholder')}
              sx={{ mb: 2, fontFamily: 'monospace' }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Button 
                  onClick={handlePaste} 
                  variant="outlined" 
                  sx={{ mr: 1 }}
                >
                  {t('jwtDecoder.paste')}
                </Button>
                <Button 
                  onClick={handleClear} 
                  variant="outlined" 
                  color="secondary" 
                  startIcon={<Delete />}
                >
                  {t('jwtDecoder.clear')}
                </Button>
              </Box>
              <FormControlLabel
                control={
                  <Switch 
                    checked={showVerification} 
                    onChange={(e) => setShowVerification(e.target.checked)} 
                  />
                }
                label={t('jwtDecoder.showVerification')}
              />
            </Box>
            
            {showVerification && (
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('jwtDecoder.verificationSection')}
                  <Tooltip title={t('jwtDecoder.verificationHelp')}>
                    <IconButton size="small">
                      <HelpOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                
                <TextField
                  label={t('jwtDecoder.secretInputLabel')}
                  value={verificationSecret}
                  onChange={handleSecretChange}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                  type="password"
                  placeholder={t('jwtDecoder.secretPlaceholder')}
                />
                
                <Button 
                  onClick={verifyToken} 
                  variant="contained" 
                  color="primary" 
                  startIcon={<SecurityOutlined />}
                  disabled={!jwtToken || !verificationSecret}
                >
                  {t('jwtDecoder.verifyButton')}
                </Button>
                
                {isVerified === true && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {t('jwtDecoder.signatureValid')}
                  </Alert>
                )}
                
                {isVerified === false && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {t('jwtDecoder.signatureInvalid')}
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {decodedJwt && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('jwtDecoder.decodedToken')}
              </Typography>
              
              {/* Token Status */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  icon={tokenInfo.isExpired ? <ErrorOutline /> : <CheckCircleOutline />}
                  label={tokenInfo.isExpired ? t('jwtDecoder.expired') : t('jwtDecoder.valid')}
                  color={tokenInfo.isExpired ? 'error' : 'success'}
                />
                
                {tokenInfo.expiresIn && !tokenInfo.isExpired && (
                  <Chip 
                    icon={<Info />} 
                    label={`${t('jwtDecoder.expiresIn')}: ${tokenInfo.expiresIn}`} 
                    variant="outlined" 
                  />
                )}
                
                {tokenInfo.issuer && (
                  <Chip 
                    label={`${t('jwtDecoder.issuer')}: ${tokenInfo.issuer}`} 
                    variant="outlined" 
                  />
                )}
              </Box>
              
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label={t('jwtDecoder.headerTab')} />
                <Tab label={t('jwtDecoder.payloadTab')} />
                <Tab label={t('jwtDecoder.signatureTab')} />
              </Tabs>
              
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ position: 'relative' }}>
                  <SyntaxHighlighter language="json" style={vscDarkPlus} showLineNumbers>
                    {formatJson(decodedJwt.header)}
                  </SyntaxHighlighter>
                  <Tooltip title={t('jwtDecoder.copyTooltip')}>
                    <IconButton 
                      onClick={() => copyToClipboard(formatJson(decodedJwt.header), 'header')}
                      sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {t('jwtDecoder.headerDescription')}
                </Typography>
              </TabPanel>
              
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ position: 'relative' }}>
                  <SyntaxHighlighter 
                    language="json" 
                    style={vscDarkPlus} 
                    showLineNumbers
                    wrapLongLines={true}
                    customStyle={{position: 'relative'}}
                    renderer={({ stylesheet }) => {
                      // 使用自定义渲染器来显示带有提示的时间戳
                      return (
                        <pre style={{
                          ...stylesheet['pre'], 
                          padding: '1em', 
                          margin: 0, 
                          backgroundColor: 'rgb(30, 30, 30)',
                          color: 'white'
                        }}>
                          {renderJsonWithTimeTooltips(decodedJwt.payload)}
                        </pre>
                      );
                    }}
                  >
                    {formatJson(decodedJwt.payload)}
                  </SyntaxHighlighter>
                  <Tooltip title={t('jwtDecoder.copyTooltip')}>
                    <IconButton 
                      onClick={() => copyToClipboard(formatJson(decodedJwt.payload), 'payload')}
                      sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 1 }}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {t('jwtDecoder.payloadDescription')}
                </Typography>
              </TabPanel>
              
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ position: 'relative' }}>
                  <SyntaxHighlighter language="text" style={vscDarkPlus}>
                    {decodedJwt.signature}
                  </SyntaxHighlighter>
                  <Tooltip title={t('jwtDecoder.copyTooltip')}>
                    <IconButton 
                      onClick={() => copyToClipboard(decodedJwt.signature, 'signature')}
                      sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {t('jwtDecoder.signatureDescription')}
                </Typography>
              </TabPanel>
            </Paper>
          </Grid>
        )}
        
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">
              <strong>{t('jwtDecoder.errorTitle')}:</strong> {error}
            </Alert>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('jwtDecoder.aboutJwt')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('jwtDecoder.jwtDefinition')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('jwtDecoder.jwtStructure')}
            </Typography>
            <Typography variant="body2">
              {t('jwtDecoder.jwtUsage')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
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