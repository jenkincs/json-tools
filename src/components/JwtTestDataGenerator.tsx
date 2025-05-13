import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ContentCopy, Refresh, ExpandMore, AccessTime } from '@mui/icons-material';
import * as jose from 'jose';

interface JwtTestDataGeneratorProps {
  onSelectToken: (token: string) => void;
  onSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

interface JwtOptions {
  algorithm: 'HS256' | 'HS384' | 'HS512';
  expiresIn: number | null;
  issuer: string;
  subject: string;
  audience: string;
  customClaims: string;
}

interface TokenWithMetadata {
  token: string;
  timestamp: Date;
  type: 'standard' | 'expired' | 'neverExpiring';
}

export function JwtTestDataGenerator({ onSelectToken, onSnackbar }: JwtTestDataGeneratorProps) {
  const { t } = useTranslation();
  const [generatedTokens, setGeneratedTokens] = useState<TokenWithMetadata[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [options, setOptions] = useState<JwtOptions>({
    algorithm: 'HS256',
    expiresIn: 3600, // 1 hour
    issuer: 'https://myapp.example.com',
    subject: 'user123',
    audience: 'https://api.example.com',
    customClaims: '{\n  "name": "John Doe",\n  "role": "admin"\n}'
  });
  const [error, setError] = useState<string | null>(null);

  // 生成JWT令牌
  const generateToken = async (tokenType: 'standard' | 'expired' | 'neverExpiring' = 'standard') => {
    setError(null);
    try {
      // 创建自定义声明
      let customClaims = {};
      try {
        customClaims = JSON.parse(options.customClaims);
      } catch (err) {
        throw new Error(t('jwtDecoder.errors.invalidJson'));
      }

      // 创建标准声明
      const currentTime = Math.floor(Date.now() / 1000);
      const claims: any = {
        ...customClaims,
        iat: currentTime,
      };

      if (options.issuer) claims.iss = options.issuer;
      if (options.subject) claims.sub = options.subject;
      if (options.audience) claims.aud = options.audience;
      
      // 根据令牌类型设置过期时间
      let expiresIn = options.expiresIn;
      if (tokenType === 'expired') {
        expiresIn = -3600; // 1小时前过期
      } else if (tokenType === 'neverExpiring') {
        expiresIn = null; // 永不过期
      }
      
      // 如果设置了过期时间
      if (expiresIn !== null) {
        claims.exp = currentTime + expiresIn;
      }

      // 创建签名密钥
      const encoder = new TextEncoder();
      const secretKey = encoder.encode(secret);

      // 创建JWT
      const jwt = await new jose.SignJWT(claims)
        .setProtectedHeader({ alg: options.algorithm })
        .sign(secretKey);

      // 创建带时间戳的令牌对象
      const tokenWithMetadata: TokenWithMetadata = {
        token: jwt,
        timestamp: new Date(),
        type: tokenType
      };

      // 将新生成的令牌添加到列表最前面
      setGeneratedTokens(prev => [tokenWithMetadata, ...prev.slice(0, 9)]); // 保留最近10个
      
      // 显示成功消息
      const messageKey = tokenType === 'standard' 
        ? 'jwtDecoder.messages.tokenGenerated' 
        : tokenType === 'expired' 
          ? 'jwtDecoder.messages.expiredTokenGenerated'
          : 'jwtDecoder.messages.neverExpiringTokenGenerated';
      
      onSnackbar(t(messageKey), 'success');
    } catch (err) {
      console.error('JWT generation error:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // 生成一个过期的令牌
  const generateExpiredToken = () => {
    generateToken('expired');
  };

  // 生成一个永不过期的令牌
  const generateNeverExpiringToken = () => {
    generateToken('neverExpiring');
  };

  // 复制令牌到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        onSnackbar(t('jwtDecoder.messages.tokenCopied'), 'success');
      },
      (err) => {
        console.error('Failed to copy:', err);
        onSnackbar(t('common.error.clipboard'), 'error');
      }
    );
  };

  // 使用令牌
  const useToken = (token: string) => {
    onSelectToken(token);
    onSnackbar(t('jwtDecoder.messages.tokenSelected'), 'info');
  };

  // 处理选项变更
  const handleOptionChange = (field: keyof JwtOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 格式化日期时间
  const formatDateTime = (date: Date) => {
    return date.toLocaleString();
  };

  // 获取令牌类型标签
  const getTokenTypeLabel = (type: string) => {
    switch (type) {
      case 'expired':
        return t('jwtDecoder.expiredToken');
      case 'neverExpiring':
        return t('jwtDecoder.neverExpiringToken');
      default:
        return t('jwtDecoder.standardToken');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('jwtDecoder.testDataGenerator')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('jwtDecoder.testDataDescription')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('jwtDecoder.configureToken')}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('jwtDecoder.secretKey')}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  fullWidth
                  margin="normal"
                  helperText={t('jwtDecoder.secretHelp')}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('jwtDecoder.algorithm')}</InputLabel>
                  <Select
                    value={options.algorithm}
                    label={t('jwtDecoder.algorithm')}
                    onChange={(e) => handleOptionChange('algorithm', e.target.value)}
                  >
                    <MenuItem value="HS256">HS256</MenuItem>
                    <MenuItem value="HS384">HS384</MenuItem>
                    <MenuItem value="HS512">HS512</MenuItem>
                  </Select>
                  <FormHelperText>{t('jwtDecoder.algorithmHelp')}</FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('jwtDecoder.expiresIn')}
                  type="number"
                  value={options.expiresIn === null ? '' : options.expiresIn}
                  onChange={(e) => handleOptionChange('expiresIn', e.target.value === '' ? null : Number(e.target.value))}
                  fullWidth
                  margin="normal"
                  helperText={t('jwtDecoder.expiresInHelp')}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('jwtDecoder.issuer')}
                  value={options.issuer}
                  onChange={(e) => handleOptionChange('issuer', e.target.value)}
                  fullWidth
                  margin="normal"
                  helperText={t('jwtDecoder.issuerHelp')}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('jwtDecoder.subject')}
                  value={options.subject}
                  onChange={(e) => handleOptionChange('subject', e.target.value)}
                  fullWidth
                  margin="normal"
                  helperText={t('jwtDecoder.subjectHelp')}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('jwtDecoder.audience')}
                  value={options.audience}
                  onChange={(e) => handleOptionChange('audience', e.target.value)}
                  fullWidth
                  margin="normal"
                  helperText={t('jwtDecoder.audienceHelp')}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label={t('jwtDecoder.customClaims')}
                  value={options.customClaims}
                  onChange={(e) => handleOptionChange('customClaims', e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  helperText={t('jwtDecoder.customClaimsHelp')}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button 
                onClick={() => generateToken('standard')} 
                variant="contained" 
                color="primary"
                startIcon={<Refresh />}
              >
                {t('jwtDecoder.generateToken')}
              </Button>
              <Button 
                onClick={generateExpiredToken} 
                variant="outlined"
              >
                {t('jwtDecoder.generateExpiredDirect')}
              </Button>
              <Button 
                onClick={generateNeverExpiringToken} 
                variant="outlined"
              >
                {t('jwtDecoder.generateNeverExpiringDirect')}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">
              <strong>{t('jwtDecoder.errorTitle')}:</strong> {error}
            </Alert>
          </Grid>
        )}
        
        {generatedTokens.length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {t('jwtDecoder.generatedTokens')}
              </Typography>
              {generatedTokens.length > 1 && (
                <Button
                  startIcon={showHistory ? <ExpandMore sx={{ transform: 'rotate(180deg)' }} /> : <ExpandMore />}
                  onClick={() => setShowHistory(!showHistory)}
                  size="small"
                >
                  {showHistory 
                    ? t('jwtDecoder.hideHistory') 
                    : t('jwtDecoder.showHistory')}
                </Button>
              )}
            </Box>
            
            {/* 最新令牌 */}
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader
                title={getTokenTypeLabel(generatedTokens[0].type)}
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(generatedTokens[0].timestamp)}
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {generatedTokens[0].token}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => useToken(generatedTokens[0].token)}>
                  {t('jwtDecoder.useToken')}
                </Button>
                <Tooltip title={t('jwtDecoder.copyToClipboard')}>
                  <IconButton size="small" onClick={() => copyToClipboard(generatedTokens[0].token)}>
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
            
            {/* 历史令牌 */}
            <Collapse in={showHistory}>
              <Stack spacing={2}>
                {generatedTokens.slice(1).map((tokenData, index) => (
                  <Accordion key={index} disableGutters>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                    >
                      <Typography variant="subtitle2">
                        {getTokenTypeLabel(tokenData.type)} - {formatDateTime(tokenData.timestamp)}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-wrap',
                          mb: 2
                        }}
                      >
                        {tokenData.token}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" onClick={() => useToken(tokenData.token)}>
                          {t('jwtDecoder.useToken')}
                        </Button>
                        <Tooltip title={t('jwtDecoder.copyToClipboard')}>
                          <IconButton size="small" onClick={() => copyToClipboard(tokenData.token)}>
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Collapse>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('jwtDecoder.testingTips')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('jwtDecoder.tip1')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('jwtDecoder.tip2')}
            </Typography>
            <Typography variant="body2">
              {t('jwtDecoder.tip3')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 