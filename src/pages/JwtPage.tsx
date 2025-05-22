import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { JwtDecoderPanel } from '../components/JwtDecoderPanel';
import { JwtEncoderPanel } from '../components/JwtEncoderPanel';

export default function JwtPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'decode' | 'encode'>('decode');
  const [, setSnackbar] = useState<{ msg: string; severity?: any } | null>(null);

  return (
    <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', mt: 4 }}>
      {/* 顶部切换按钮 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 3 }}>
        <Typography
          variant="h4"
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
          variant="h4"
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
      </Box>
      {/* 内容区 */}
      {mode === 'decode' ? (
        <JwtDecoderPanel onSnackbar={(msg, severity) => setSnackbar({ msg, severity })} />
      ) : (
        <JwtEncoderPanel onSnackbar={(msg, severity) => setSnackbar({ msg, severity })} />
      )}
      {/* Snackbar 可选实现 */}
    </Box>
  );
} 