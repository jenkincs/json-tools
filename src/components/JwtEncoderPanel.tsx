import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Alert,
  IconButton,
  styled,
  useTheme
} from '@mui/material';
import {
  ContentCopy,
  SecurityOutlined
} from '@mui/icons-material';
import * as jose from 'jose';
import Editor, { Monaco } from '@monaco-editor/react';

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

const timeFields = ['exp', 'iat', 'nbf', 'auth_time', 'updated_at'];

export function JwtEncoderPanel({ onSnackbar }: { onSnackbar: (msg: string, severity?: any) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [header, setHeader] = useState<string>(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
  const [payload, setPayload] = useState<string>(JSON.stringify({ sub: 'test-user', name: 'Test User', role: 'admin', iss: 'jsongeeks.dev', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 }, null, 2));
  const [secret, setSecret] = useState<string>('your-256-bit-secret');
  const [jwt, setJwt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // 编辑器主题配置
  const editorOptions = {
    minimap: { enabled: false },
    lineNumbers: 'off' as const,
    fontSize: 14,
    wordWrap: 'on' as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    theme: theme.palette.mode === 'dark' ? 'vs-dark' : 'light',
  };

  // 编辑器挂载时设置主题
  const handleEditorMount = (_editor: any, monaco: Monaco) => {
    if (theme.palette.mode === 'dark') {
      monaco.editor.setTheme('vs-dark');
    } else {
      monaco.editor.setTheme('light');
    }
  };

  const handleEncode = async () => {
    setError(null);
    try {
      const headerObj = JSON.parse(header);
      const payloadObj = JSON.parse(payload);
      const encoder = new TextEncoder();
      const secretKey = encoder.encode(secret);
      const jwtToken = await new jose.SignJWT(payloadObj)
        .setProtectedHeader(headerObj)
        .sign(secretKey);
      setJwt(jwtToken);
      onSnackbar(t('jwtEncoder.messages.encoded'), 'success');
    } catch (e: any) {
      setError(e.message || String(e));
      setJwt('');
      onSnackbar(t('jwtEncoder.messages.encodeError'), 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => onSnackbar(t('jwtEncoder.messages.copied'), 'success'),
      () => onSnackbar(t('common.error.clipboard'), 'error')
    );
  };

  // Hover provider for time fields
  const handlePayloadEditorMount = (_editor: any, monaco: Monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: []
    });

    monaco.languages.registerHoverProvider('json', {
      provideHover: function (model, position) {
        const wordAtPosition = model.getWordAtPosition(position);
        if (!wordAtPosition) return null;

        const line = model.getLineContent(position.lineNumber);
        const timeFieldMatch = timeFields.some(field => line.includes(`"${field}"`));
        
        if (timeFieldMatch) {
          const numberMatch = line.match(/:\s*(\d+)/);
          if (numberMatch && numberMatch[1]) {
            const timestamp = parseInt(numberMatch[1], 10);
            if (!isNaN(timestamp)) {
              const date = new Date(timestamp * 1000);
              return {
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: wordAtPosition.startColumn,
                  endLineNumber: position.lineNumber,
                  endColumn: wordAtPosition.endColumn
                },
                contents: [
                  { value: `Local time: ${date.toLocaleString()}` }
                ]
              };
            }
          }
        }
        return null;
      }
    });
  };

  return (
    <JwtContainer>
      {/* 左侧：输入区域 */}
      <JwtColumn elevation={2}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>{t('jwtEncoder.inputArea')}</Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{t('jwtEncoder.header')}</Typography>
          <Editor
            height="100px"
            language="json"
            value={header}
            onChange={v => setHeader(v || '')}
            options={editorOptions}
            onMount={handleEditorMount}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{t('jwtEncoder.payload')}</Typography>
          <Editor
            height="140px"
            language="json"
            value={payload}
            onChange={v => setPayload(v || '')}
            onMount={(editor, monaco) => {
              handleEditorMount(editor, monaco);
              handlePayloadEditorMount(editor, monaco);
            }}
            options={editorOptions}
          />
        </Box>
        <TextField
          label={t('jwtEncoder.secret')}
          value={secret}
          onChange={e => setSecret(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          startIcon={<SecurityOutlined />}
          onClick={handleEncode}
          sx={{ mt: 1 }}
        >
          {t('jwtEncoder.encode')}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </JwtColumn>
      {/* 右侧：输出区域 */}
      <JwtColumn elevation={2}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>{t('jwtEncoder.outputArea')}</Typography>
        {jwt ? (
          <Box sx={{ position: 'relative', flex: 1 }}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderRadius: '4px',
                minHeight: 120,
                fontFamily: 'monospace',
                fontSize: '1rem',
                p: 2,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                overflowX: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {jwt}
            </Box>
            <IconButton
              size="small"
              onClick={() => copyToClipboard(jwt)}
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', color: 'text.secondary', '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2 }}>{t('jwtEncoder.noOutput')}</Typography>
        )}
      </JwtColumn>
    </JwtContainer>
  );
} 